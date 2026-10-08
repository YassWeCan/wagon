// Transforme des lignes "agence × mois" en un rapport prêt pour la vidéo (data/rapport.json).
// Entrée : lignes { agence_id, agence_nom, ville, mois: "YYYY-MM", periode: "courante"|"precedente",
//                   leads, rdv, devis, eresa, fidelite }
import { writeFileSync } from "node:fs";

export const KPIS = ["leads", "rdv", "devis", "eresa", "fidelite"];

const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
  "septembre", "octobre", "novembre", "décembre"];

const vide = () => Object.fromEntries(KPIS.map((k) => [k, 0]));
const add = (a, b) => KPIS.forEach((k) => (a[k] += Number(b[k] ?? 0)));
// "Contacts générés" = leads + RDV + devis + e-résa. Les cartes fidélité sont suivies à part
// (ce n'est pas une demande client). ⚠️ Si dans ta base un RDV est AUSSI compté comme lead,
// retire "o.leads" de cette formule, sinon tu comptes deux fois la même personne.
const total = (o) => o.leads + o.rdv + o.devis + o.eresa;
const evol = (cur, prev) => (prev > 0 ? (cur - prev) / prev : null);

export function construireRapport({ rows, adherentNom, dateDebut, dateFin, out = "data/rapport.json" }) {
  const courant = rows.filter((r) => r.periode === "courante");
  const precedent = rows.filter((r) => r.periode === "precedente");

  // Totaux réseau
  const totals = vide();
  courant.forEach((r) => add(totals, r));
  const prevTotals = vide();
  precedent.forEach((r) => add(prevTotals, r));

  // Par mois
  const moisMap = new Map();
  for (const r of courant) {
    if (!moisMap.has(r.mois)) moisMap.set(r.mois, { mois: r.mois, ...vide() });
    add(moisMap.get(r.mois), r);
  }
  const months = [...moisMap.values()]
    .sort((a, b) => a.mois.localeCompare(b.mois))
    .map((m) => ({ ...m, label: MOIS_FR[Number(m.mois.slice(5, 7)) - 1] }));

  // Par agence (période courante + précédente)
  const agMap = new Map();
  const getAg = (r) => {
    if (!agMap.has(r.agence_id))
      agMap.set(r.agence_id, { id: r.agence_id, nom: r.agence_nom, ville: r.ville ?? "", cur: vide(), prev: vide() });
    return agMap.get(r.agence_id);
  };
  courant.forEach((r) => add(getAg(r).cur, r));
  precedent.forEach((r) => add(getAg(r).prev, r));

  const agences = [...agMap.values()].map((a) => ({
    id: a.id,
    nom: a.nom,
    ville: a.ville,
    ...a.cur,
    total: total(a.cur),
    total_prev: total(a.prev),
    evolution: evol(total(a.cur), total(a.prev)),
  }));
  agences.sort((a, b) => b.total - a.total);

  // Agences en baisse : uniquement celles avec un volume précédent significatif (évite les -100 % sur 2 leads)
  const seuil = Math.max(10, Math.round((total(prevTotals) / Math.max(agences.length, 1)) * 0.25));
  const toutesEnBaisse = agences
    .filter((a) => a.total_prev >= seuil && a.evolution !== null && a.evolution < 0)
    .sort((a, b) => a.evolution - b.evolution);
  const enBaisse = toutesEnBaisse.slice(0, 5);
  const enHausse = agences
    .filter((a) => a.total_prev >= seuil && a.evolution !== null && a.evolution > 0)
    .sort((a, b) => b.evolution - a.evolution)
    .slice(0, 5);

  const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }).replace(/^1 /, "1er ");

  const rapport = {
    genere_le: new Date().toISOString(),
    adherent: { nom: adherentNom, nb_agences: agences.length },
    periode: { debut: dateDebut, fin: dateFin, label: `du ${fmt(dateDebut)} au ${fmt(dateFin)}` },
    totals: { ...totals, total: total(totals) },
    previous_totals: { ...prevTotals, total: total(prevTotals) },
    evolutions: Object.fromEntries([...KPIS, "total"].map((k) => [k, evol(
      k === "total" ? total(totals) : totals[k],
      k === "total" ? total(prevTotals) : prevTotals[k],
    )])),
    months,
    agences,
    top: agences.slice(0, 10),
    en_hausse: enHausse,
    en_baisse: enBaisse,
    nb_en_baisse: toutesEnBaisse.length,
    agences_sans_activite: agences.filter((a) => a.total === 0).map((a) => a.nom),
  };

  writeFileSync(out, JSON.stringify(rapport, null, 2));
  return rapport;
}

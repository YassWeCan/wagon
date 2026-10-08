// Écrit le texte de la voix off, scène par scène, à partir des VRAIS chiffres de data/rapport.json.
// Pas d'IA ici : chaque chiffre prononcé vient directement des données (zéro risque d'invention).
const n = (x) => Math.round(x).toLocaleString("fr-FR").replace(/ | /g, " ");
const pct = (x) => `${Math.abs(Math.round(x * 100))} pour cent`;
const sens = (x) => (x === null ? "" : x >= 0 ? `en hausse de ${pct(x)}` : `en baisse de ${pct(x)}`);

export const SCENES = ["intro", "kpis", "mois", "top", "tendances", "outro"];

export function ecrireNarration(r) {
  const meilleurMois = [...r.months].sort((a, b) => (b.leads + b.rdv + b.devis + b.eresa) - (a.leads + a.rdv + a.devis + a.eresa))[0];
  const top3 = r.top.slice(0, 3);
  return {
    intro: `Bonjour. Voici le bilan digital du réseau ${r.adherent.nom}, sur ses ${r.adherent.nb_agences} agences Profil Plus, ${r.periode.label}.`,
    kpis: `Sur la période, le site a généré ${n(r.totals.total)} contacts, ${sens(r.evolutions.total)} par rapport aux trois mois précédents. `
      + `Dont ${n(r.totals.leads)} leads, ${n(r.totals.rdv)} rendez-vous, ${n(r.totals.devis)} devis et ${n(r.totals.eresa)} e-réservations. `
      + `Et ${n(r.totals.fidelite)} nouvelles cartes de fidélité.`,
    mois: meilleurMois ? `Le mois le plus fort a été ${meilleurMois.label}.` : "",
    top: `En tête du classement : ${top3.map((a) => a.nom.replace(/^Profil Plus /, "")).join(", ")}. `
      + `À elle seule, la première agence totalise ${n(top3[0]?.total ?? 0)} contacts.`,
    tendances: [
      r.en_hausse[0] ? `Plus forte progression : ${r.en_hausse[0].nom.replace(/^Profil Plus /, "")}, ${sens(r.en_hausse[0].evolution)}.` : "",
      r.en_baisse.length ? `À surveiller : ${r.nb_en_baisse} agence${r.nb_en_baisse > 1 ? "s sont" : " est"} en recul, notamment ${r.en_baisse[0].nom.replace(/^Profil Plus /, "")}.` : "Aucune agence significative en recul.",
    ].join(" "),
    outro: `Merci pour votre confiance. Rendez-vous au prochain trimestre.`,
  };
}

// ÉTAPE 1 (test) : génère de FAUSSES données pour 63 agences, pour voir la vidéo sans BigQuery.
import { loadEnv } from "./env.mjs";
import { construireRapport } from "./construire-rapport.mjs";
loadEnv();

const VILLES = ["Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Bordeaux", "Lille", "Rennes", "Reims",
  "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand", "Le Mans", "Aix-en-Provence", "Brest",
  "Tours", "Amiens", "Limoges", "Annecy", "Perpignan", "Metz", "Besançon", "Orléans", "Rouen", "Caen",
  "Nancy", "Avignon", "Poitiers", "Pau", "La Rochelle", "Valence", "Chambéry", "Niort", "Lorient", "Vannes",
  "Quimper", "Bayonne", "Colmar", "Troyes", "Chartres", "Angoulême", "Cholet", "Saint-Brieuc", "Albi",
  "Béziers", "Montauban", "Agen", "Périgueux", "Laval", "Blois", "Bourges", "Auxerre", "Mâcon", "Vichy",
  "Roanne", "Gap", "Arles", "Sète", "Carcassonne", "Tarbes"];

// Générateur pseudo-aléatoire déterministe (même résultat à chaque lancement)
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const rows = [];
const moisCour = ["2026-07", "2026-08", "2026-09"];
const moisPrev = ["2026-04", "2026-05", "2026-06"];
VILLES.forEach((ville, i) => {
  const taille = 0.4 + rand() * 1.8; // certaines agences sont plus grosses
  const tendance = 0.75 + rand() * 0.55; // évolution vs période précédente
  const ligne = (mois, periode, f) => ({
    agence_id: `AG${String(i + 1).padStart(3, "0")}`,
    agence_nom: `Profil Plus ${ville}`,
    ville,
    mois,
    periode,
    leads: Math.round((60 + rand() * 40) * taille * f),
    rdv: Math.round((35 + rand() * 25) * taille * f),
    devis: Math.round((25 + rand() * 20) * taille * f),
    eresa: Math.round((15 + rand() * 15) * taille * f),
    fidelite: Math.round((20 + rand() * 30) * taille * f),
  });
  moisPrev.forEach((m) => rows.push(ligne(m, "precedente", 1)));
  moisCour.forEach((m, j) => rows.push(ligne(m, "courante", tendance * (1 + (j === 1 ? -0.12 : 0.04)))));
});

const r = construireRapport({
  rows,
  adherentNom: process.env.ADHERENT_NOM || "Groupe Démo",
  dateDebut: "2026-07-01",
  dateFin: "2026-09-30",
});
console.log(`✅ Données de démo créées : ${r.adherent.nb_agences} agences, ${r.totals.total} contacts générés → data/rapport.json`);

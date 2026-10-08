// ÉTAPE 2 : interroge BigQuery et fabrique data/rapport.json
// Prérequis : "gcloud auth login" fait + la requête sql/rapport-adherent.sql adaptée à ta base.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { loadEnv, requireEnv } from "./env.mjs";
import { construireRapport } from "./construire-rapport.mjs";
loadEnv();

const projet = requireEnv("GCP_PROJECT");
const adherentId = requireEnv("ADHERENT_ID");
const adherentNom = requireEnv("ADHERENT_NOM");
const dateDebut = requireEnv("DATE_DEBUT");
const dateFin = requireEnv("DATE_FIN");

const sql = readFileSync("sql/rapport-adherent.sql", "utf8");
// Si ton ID adhérent est un nombre dans BigQuery, mets ADHERENT_ID_TYPE=INT64 dans le .env
const typeId = process.env.ADHERENT_ID_TYPE || "STRING";

console.log(`⏳ Requête BigQuery pour "${adherentNom}" (${dateDebut} → ${dateFin})…`);
let sortie;
try {
  sortie = execFileSync("bq", [
    `--project_id=${projet}`,
    "query",
    "--use_legacy_sql=false",
    "--format=json",
    "--max_rows=100000",
    `--parameter=adherent_id:${typeId}:${adherentId}`,
    `--parameter=date_debut:DATE:${dateDebut}`,
    `--parameter=date_fin:DATE:${dateFin}`,
    sql,
  ], { encoding: "utf8", maxBuffer: 200 * 1024 * 1024 });
} catch (e) {
  console.error("❌ BigQuery a refusé la requête. Message :\n", e.stderr || e.message);
  console.error("👉 Vérifie : 1) gcloud auth login  2) GCP_PROJECT  3) les noms de tables dans sql/rapport-adherent.sql");
  process.exit(1);
}

// bq peut afficher des lignes d'info avant le JSON : on garde uniquement le tableau JSON
const rows = JSON.parse(sortie.slice(sortie.indexOf("[")));
writeFileSync(`data/brut-${adherentId}.json`, JSON.stringify(rows, null, 2));

if (rows.length === 0) {
  console.error("❌ 0 ligne renvoyée. L'ID adhérent ou les dates sont probablement faux.");
  process.exit(1);
}

const r = construireRapport({ rows, adherentNom, dateDebut, dateFin });
console.log(`✅ ${r.adherent.nb_agences} agences, ${r.totals.total} contacts générés → data/rapport.json`);
if (r.agences_sans_activite.length)
  console.warn(`⚠️  ${r.agences_sans_activite.length} agence(s) sans aucune activité : ${r.agences_sans_activite.join(", ")}`);

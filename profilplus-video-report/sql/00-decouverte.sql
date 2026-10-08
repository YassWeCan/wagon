-- ÉTAPE 0 : "Qu'y a-t-il dans la base ?"
-- Liste toutes les tables et colonnes d'un dataset. Remplace MON_PROJET et MON_DATASET.
-- À coller dans la console BigQuery (console.cloud.google.com/bigquery) → bouton "Exécuter".
SELECT
  table_name,
  column_name,
  data_type
FROM `MON_PROJET.MON_DATASET.INFORMATION_SCHEMA.COLUMNS`
ORDER BY table_name, ordinal_position;

-- Rapport adhérent : 1 ligne par agence × mois × période (courante / précédente).
-- Paramètres (fournis automatiquement par le script) : @adherent_id, @date_debut, @date_fin
--
-- 👉 LA SEULE PARTIE À ADAPTER est le bloc "evenements" ci-dessous :
--    remplace les noms de tables/colonnes (en MAJUSCULES) par les vrais noms de ta base.
--    Tout le reste fonctionne tel quel.

WITH
-- Période précédente de même durée (pour calculer les évolutions)
params AS (
  SELECT DATE_SUB(@date_debut, INTERVAL DATE_DIFF(@date_fin, @date_debut, DAY) + 1 DAY) AS prev_debut
),

-- 1) Un événement = une ligne (un lead, un RDV, un devis, une e-résa, une carte fidélité)
evenements AS (
  SELECT
    e.ID_AGENCE                 AS agence_id,
    DATE(e.DATE_CREATION)       AS jour,
    -- Traduit le type de ta base vers 5 catégories standard
    CASE e.TYPE_EVENEMENT
      WHEN 'LEAD'      THEN 'leads'
      WHEN 'RDV'       THEN 'rdv'
      WHEN 'DEVIS'     THEN 'devis'
      WHEN 'ERESA'     THEN 'eresa'
      WHEN 'FIDELITE'  THEN 'fidelite'
    END                         AS type
  FROM `MON_PROJET.MON_DATASET.TABLE_EVENEMENTS` e
  -- Exclure les tests / doublons si ta base en contient, ex :
  -- WHERE e.EST_TEST = FALSE
),

-- 2) Les agences de l'adhérent
agences AS (
  SELECT
    a.ID_AGENCE   AS agence_id,
    a.NOM_AGENCE  AS agence_nom,
    a.VILLE       AS ville
  FROM `MON_PROJET.MON_DATASET.TABLE_AGENCES` a
  WHERE a.ID_ADHERENT = @adherent_id
)

-- 3) Agrégation (ne pas modifier)
SELECT
  ag.agence_id,
  ag.agence_nom,
  ag.ville,
  FORMAT_DATE('%Y-%m', ev.jour)                                   AS mois,
  IF(ev.jour >= @date_debut, 'courante', 'precedente')            AS periode,
  COUNTIF(ev.type = 'leads')                                      AS leads,
  COUNTIF(ev.type = 'rdv')                                        AS rdv,
  COUNTIF(ev.type = 'devis')                                      AS devis,
  COUNTIF(ev.type = 'eresa')                                      AS eresa,
  COUNTIF(ev.type = 'fidelite')                                   AS fidelite
FROM agences ag
CROSS JOIN params p
LEFT JOIN evenements ev
  ON ev.agence_id = ag.agence_id
 AND ev.jour BETWEEN p.prev_debut AND @date_fin
GROUP BY 1, 2, 3, 4, 5
ORDER BY agence_nom, mois;

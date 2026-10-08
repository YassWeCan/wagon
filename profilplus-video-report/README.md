# 🎬 Rapport vidéo animé par adhérent — Profil Plus

**Ce que ça fait :** BigQuery ➜ chiffres de l'adhérent ➜ vidéo MP4 animée (≈ 45 s) ➜ avec voix off.

```
 BigQuery ──► data/rapport.json ──► texte voix off ──► MP3 (ElevenLabs) ──► vidéo MP4 (Remotion)
  étape 4         étape 4               étape 5             étape 5              étape 6
```

> 🧠 **Mode d'emploi TDAH** : une étape = une case à cocher. Ne lis PAS la suite tant que la case n'est pas cochée.
> Chaque étape dit : ⏱ combien de temps · ✅ comment savoir que c'est bon · 🆘 quoi faire si ça plante.

---

## ☐ Étape 1 — Installer les outils (une seule fois)

⏱ 15 min

1. Installe **Node.js** (version 20 ou plus) : https://nodejs.org → bouton vert « LTS » → suivant, suivant, terminer.
2. Installe **Google Cloud CLI** : https://cloud.google.com/sdk/docs/install → suis l'installeur.
3. Ouvre un **Terminal** (Mac : `Cmd + Espace` → tape « Terminal »).
4. Tape ces 2 commandes (une par une, `Entrée` après chaque) :

```bash
node -v
gcloud -v
```

✅ C'est bon si : les deux affichent un numéro de version.
🆘 « command not found » ➜ ferme le Terminal, rouvre-le, réessaie.

---

## ☐ Étape 2 — Récupérer le projet et l'installer

⏱ 5 min

```bash
git clone https://github.com/YassWeCan/wagon.git
cd wagon/profilplus-video-report
npm install
```

✅ C'est bon si : ça finit par `found 0 vulnerabilities` (ou similaire), sans `ERR!`.

---

## ☐ Étape 3 — Voir la vidéo de DÉMO (sans BigQuery)

⏱ 5 min · 🎯 But : vérifier que tout marche AVANT de toucher aux vraies données.

```bash
npm run demo-data
npm run studio
```

Ton navigateur s'ouvre sur **Remotion Studio**. Appuie sur ▶️ : tu vois la vidéo avec 63 fausses agences.

✅ C'est bon si : la vidéo se joue.
🛑 Ferme le studio avec `Ctrl + C` dans le Terminal.

---

## ☐ Étape 4 — Brancher les VRAIES données BigQuery

⏱ 30 à 60 min (la seule étape « réfléchie », fais-la au calme)

### 4a. Se connecter à Google

```bash
gcloud auth login
gcloud auth application-default login
```

Une page Google s'ouvre ➜ connecte-toi avec le compte qui a accès au BigQuery.

### 4b. Trouver les noms des tables

1. Va sur https://console.cloud.google.com/bigquery
2. Ouvre le fichier `sql/00-decouverte.sql`, copie son contenu dans la console.
3. Remplace `MON_PROJET` et `MON_DATASET` par les tiens (visibles dans le panneau de gauche).
4. Clique **Exécuter**.

✅ Tu obtiens la liste de toutes les tables et colonnes.

👉 **Note sur un papier** :
- la table où sont les leads / RDV / devis / e-résa / cartes fidélité
- la colonne « agence », la colonne « date », la colonne « type »
- la table des agences et la colonne « adhérent »

💡 **Raccourci** : ton prestataire a déjà fait ce travail. Demande-lui simplement **sa requête SQL**. 5 min de mail = 1 h gagnée.

### 4c. Adapter la requête

Ouvre `sql/rapport-adherent.sql`. **Ne modifie que les mots en MAJUSCULES** (noms de tables/colonnes, valeurs du `CASE`).
Teste-la dans la console BigQuery en remplaçant temporairement `@adherent_id`, `@date_debut`, `@date_fin` par des vraies valeurs (`'12345'`, `DATE '2026-07-01'`, `DATE '2026-09-30'`).

✅ C'est bon si : tu obtiens ≈ 63 agences × 6 mois de lignes, avec des chiffres qui ressemblent à ce que tu connais.

### 4d. Remplir le fichier de réglages

```bash
cp .env.example .env
```

Ouvre `.env` et remplis : `GCP_PROJECT`, `ADHERENT_ID`, `ADHERENT_NOM`, `DATE_DEBUT`, `DATE_FIN`.
(Si l'ID adhérent est un nombre dans BigQuery, ajoute la ligne `ADHERENT_ID_TYPE=INT64`.)

### 4e. Lancer l'extraction

```bash
npm run fetch
```

✅ C'est bon si : `✅ 63 agences, XXXX contacts générés → data/rapport.json`
🆘 `0 ligne` ➜ mauvais ID adhérent ou mauvaises dates. 🆘 `Access Denied` ➜ ton compte Google n'a pas les droits : demande le rôle « BigQuery Data Viewer » + « BigQuery Job User ».

---

## ☐ Étape 5 — La voix off

⏱ 10 min

Le texte est écrit **automatiquement à partir des chiffres** (pas d'IA ➜ aucun chiffre inventé). Tu peux le modifier dans `scripts/narration.mjs`.

**Option A — automatique (recommandé)**
1. Crée un compte sur https://elevenlabs.io (offre payante d'entrée de gamme suffisante pour quelques vidéos/mois — vérifie le tarif actuel).
2. Choisis une voix française dans « Voices » ➜ copie son **Voice ID**.
3. Profil ➜ « API Keys » ➜ crée une clé.
4. Colle les deux dans `.env` (`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`).
5. Lance :

```bash
npm run voice
```

**Option B — à la main (sans clé API)**
1. `npm run voice` ➜ ouvre `data/script-voix.txt`.
2. Colle chaque paragraphe dans ElevenLabs (ou n'importe quel outil de voix), télécharge le MP3.
3. Range-le dans `public/voice/` avec **exactement** le nom indiqué (`intro.mp3`, `kpis.mp3`, …).
4. Relance `npm run voice` (il mesure la durée des MP3).

✅ C'est bon si : `✅ 6 piste(s) voix prêtes`. La vidéo s'allonge toute seule pour suivre la voix.

---

## ☐ Étape 6 — Fabriquer la vidéo

⏱ 2 à 5 min (l'ordinateur travaille, pas toi)

```bash
npm run studio     # facultatif : vérifier avant
npm run render
```

✅ C'est bon si : `out/rapport.mp4` existe. **C'est ta vidéo.** 🎉

🆘 Erreur de navigateur au rendu ➜ ajoute dans `.env` : `REMOTION_BROWSER=/chemin/vers/Google Chrome`.

---

## ☐ Étape 7 — Les fois suivantes (autre adhérent / autre trimestre)

⏱ 5 min

1. Change `ADHERENT_ID`, `ADHERENT_NOM`, `DATE_DEBUT`, `DATE_FIN` dans `.env`.
2. Une seule commande :

```bash
npm run all
```

---

## 🗺️ Où modifier quoi

| Je veux changer…              | Fichier                              |
|-------------------------------|--------------------------------------|
| Les couleurs / la police      | `src/theme.ts`                       |
| Le texte de la voix           | `scripts/narration.mjs`              |
| L'ordre ou la durée des scènes| `src/Rapport.tsx` (liste `SCENES`)   |
| Une scène précise             | `src/scenes/*.tsx`                   |
| Les données extraites         | `sql/rapport-adherent.sql`           |
| Le calcul (top, baisses…)     | `scripts/construire-rapport.mjs`     |

Astuce : ouvre ce dossier dans **Claude Code** et demande en français, ex. « ajoute une scène avec le taux de transformation devis → RDV ». C'est ce que ton prestataire a fait.

---

## ⚠️ À savoir avant de l'envoyer à un adhérent

1. **Double comptage** : « contacts générés » = leads + RDV + devis + e-résa. Si dans ta base un RDV crée AUSSI un lead, le total est gonflé. Vérifie, puis ajuste la formule dans `scripts/construire-rapport.mjs`.
2. **Licence Remotion** : gratuite pour les particuliers et les sociétés ≤ 3 personnes. Au-delà, licence entreprise payante ➜ vérifie https://www.remotion.dev/license avant tout usage commercial.
3. **RGPD** : seuls des chiffres agrégés par agence sortent de BigQuery et partent chez ElevenLabs. Ne mets jamais de nom/email/téléphone client dans la narration.
4. **Agences « à surveiller »** : seules les agences avec un volume suffisant sont comparées (évite les « −100 % » sur 2 leads). Les chiffres sont vrais, mais vérifie le classement avant de montrer la vidéo à 63 directeurs d'agence.

// ÉTAPE 3 : fabrique la voix off.
//  - Avec ELEVENLABS_API_KEY dans .env → génère automatiquement 1 MP3 par scène.
//  - Sans clé → écrit le texte dans data/script-voix.txt (tu peux le coller dans ElevenLabs à la main,
//    puis déposer les MP3 dans public/voice/ avec les noms indiqués, et relancer : npm run voice).
// Dans tous les cas, mesure la durée de chaque MP3 pour caler la vidéo dessus (src/voice-manifest.json).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadEnv } from "./env.mjs";
import { SCENES, ecrireNarration } from "./narration.mjs";
loadEnv();

const rapport = JSON.parse(readFileSync("data/rapport.json", "utf8"));
const textes = ecrireNarration(rapport);

writeFileSync(
  "data/script-voix.txt",
  SCENES.map((s) => `### Fichier à créer : public/voice/${s}.mp3\n${textes[s]}\n`).join("\n"),
);
console.log("📝 Texte de la voix off → data/script-voix.txt");

const cle = process.env.ELEVENLABS_API_KEY;
const voix = process.env.ELEVENLABS_VOICE_ID;
if (cle && voix) {
  for (const s of SCENES) {
    if (!textes[s]) continue;
    process.stdout.write(`🎙️  Génération ${s}… `);
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voix}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": cle, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textes[s],
          model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );
    if (!res.ok) {
      console.error(`\n❌ ElevenLabs a répondu ${res.status} : ${await res.text()}`);
      process.exit(1);
    }
    writeFileSync(`public/voice/${s}.mp3`, Buffer.from(await res.arrayBuffer()));
    console.log("ok");
  }
} else {
  console.log("ℹ️  Pas de clé ElevenLabs : je cherche des MP3 déposés à la main dans public/voice/.");
}

// Mesure des durées
const manifest = {};
for (const s of SCENES) {
  const f = `public/voice/${s}.mp3`;
  if (!existsSync(f)) continue;
  const d = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  manifest[s] = { fichier: `voice/${s}.mp3`, duree: Number(d.trim()) };
}
writeFileSync("src/voice-manifest.json", JSON.stringify(manifest, null, 2));
const nb = Object.keys(manifest).length;
console.log(nb ? `✅ ${nb} piste(s) voix prêtes. La vidéo s'adaptera à leur durée.` : "✅ Vidéo sans voix (aucun MP3 trouvé).");

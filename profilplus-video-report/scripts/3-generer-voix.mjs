// ÉTAPE 3 : fabrique la voix off. Trois façons, essayées dans cet ordre :
//  A) ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID dans .env → voix pro ElevenLabs (recommandé pour l'envoi client).
//  B) MP3 déjà déposés à la main dans public/voice/ (intro.mp3, kpis.mp3…) → utilisés tels quels.
//  C) Sinon → voix GRATUITE intégrée à l'ordinateur (Mac : "Thomas"/"Amélie" ; Windows : voix française
//     installée). Qualité "robot correct" : parfait pour tester, moins pour envoyer à un adhérent.
// Pour forcer la voix gratuite même si des MP3 existent : npm run voice -- --gratuite
// Dans tous les cas, la durée de chaque MP3 est mesurée pour caler la vidéo dessus (src/voice-manifest.json).
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnv } from "./env.mjs";
import { SCENES, ecrireNarration } from "./narration.mjs";
loadEnv();

// ffmpeg / ffprobe fournis par Remotion : rien à installer en plus.
const remotion = (outil, args) =>
  execFileSync("npx", ["remotion", outil, ...args], { encoding: "utf8", shell: process.platform === "win32" });

const rapport = JSON.parse(readFileSync("data/rapport.json", "utf8"));
const textes = ecrireNarration(rapport);
const scenes = SCENES.filter((s) => textes[s]);
const mp3 = (s) => `public/voice/${s}.mp3`;

writeFileSync(
  "data/script-voix.txt",
  scenes.map((s) => `### Fichier à créer : ${mp3(s)}\n${textes[s]}\n`).join("\n"),
);
console.log("📝 Texte de la voix off → data/script-voix.txt");

async function voixElevenLabs(cle, voix) {
  for (const s of scenes) {
    process.stdout.write(`🎙️  ElevenLabs : ${s}… `);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voix}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": cle, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: textes[s],
        model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) {
      console.error(`\n❌ ElevenLabs a répondu ${res.status} : ${await res.text()}`);
      console.error("👉 401 = clé fausse · 404 = Voice ID faux · 429/quota = crédits épuisés");
      process.exit(1);
    }
    writeFileSync(mp3(s), Buffer.from(await res.arrayBuffer()));
    console.log("ok");
  }
}

function voixGratuite() {
  for (const s of scenes) {
    process.stdout.write(`🎙️  Voix de l'ordinateur : ${s}… `);
    const brut = join(tmpdir(), `voix-${s}.${process.platform === "darwin" ? "aiff" : "wav"}`);
    const txt = join(tmpdir(), `voix-${s}.txt`);
    writeFileSync(txt, textes[s]);
    try {
      if (process.platform === "darwin") {
        const voix = process.env.VOIX_MAC || "Thomas";
        execFileSync("say", ["-v", voix, "-o", brut, "-f", txt]);
      } else if (process.platform === "win32") {
        const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer;`
          + `$v = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'fr*' } | Select-Object -First 1;`
          + `if ($v) { $s.SelectVoice($v.VoiceInfo.Name) };`
          + `$s.SetOutputToWaveFile('${brut}'); $s.Speak([IO.File]::ReadAllText('${txt}')); $s.Dispose()`;
        execFileSync("powershell", ["-NoProfile", "-Command", ps]);
      } else {
        execFileSync("espeak-ng", ["-v", "fr", "-w", brut, "-f", txt]);
      }
    } catch (e) {
      console.error(`\n❌ Pas de voix intégrée utilisable sur cet ordinateur (${e.message}).`);
      console.error("👉 Utilise ElevenLabs (option A du README) ou dépose tes MP3 à la main (option B).");
      process.exit(1);
    }
    remotion("ffmpeg", ["-y", "-loglevel", "error", "-i", brut, "-b:a", "128k", mp3(s)]);
    unlinkSync(brut);
    unlinkSync(txt);
    console.log("ok");
  }
}

const cle = process.env.ELEVENLABS_API_KEY;
const voixId = process.env.ELEVENLABS_VOICE_ID;
const forcerGratuite = process.argv.includes("--gratuite");
const mp3Manuels = scenes.every((s) => existsSync(mp3(s)));

if (cle && voixId && !forcerGratuite) await voixElevenLabs(cle, voixId);
else if (mp3Manuels && !forcerGratuite) console.log("ℹ️  MP3 trouvés dans public/voice/ : je les utilise.");
else {
  console.log("ℹ️  Pas de clé ElevenLabs → voix gratuite de l'ordinateur.");
  voixGratuite();
}

// Mesure des durées
const manifest = {};
for (const s of scenes) {
  if (!existsSync(mp3(s))) continue;
  const d = remotion("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3(s)]);
  manifest[s] = { fichier: `voice/${s}.mp3`, duree: Number(d.trim()) };
}
writeFileSync("src/voice-manifest.json", JSON.stringify(manifest, null, 2));
const nb = Object.keys(manifest).length;
console.log(nb === scenes.length
  ? `✅ ${nb} pistes voix prêtes. Lance maintenant : npm run render`
  : `⚠️  Seulement ${nb}/${scenes.length} pistes voix trouvées : la vidéo sera en partie muette.`);

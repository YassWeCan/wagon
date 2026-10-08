import { Audio, Series, staticFile } from "remotion";
import { FPS } from "./theme";
import type { Rapport as RapportT, VoiceManifest } from "./types";
import { Intro } from "./scenes/Intro";
import { Kpis } from "./scenes/Kpis";
import { Mois } from "./scenes/Mois";
import { Top } from "./scenes/Top";
import { Tendances } from "./scenes/Tendances";
import { Outro } from "./scenes/Outro";

// Ordre des scènes + durée minimale (secondes) si pas de voix.
// Les identifiants doivent correspondre à scripts/narration.mjs.
const SCENES = [
  { id: "intro", min: 5, C: Intro },
  { id: "kpis", min: 9, C: Kpis },
  { id: "mois", min: 6, C: Mois },
  { id: "top", min: 8, C: Top },
  { id: "tendances", min: 8, C: Tendances },
  { id: "outro", min: 4, C: Outro },
] as const;

// Chaque scène dure au moins `min` secondes, ou la durée de sa voix + 0,8 s de respiration.
export const calculerDurees = (voix: VoiceManifest) =>
  SCENES.map((s) => ({
    ...s,
    frames: Math.ceil(Math.max(s.min, (voix[s.id]?.duree ?? 0) + 0.8) * FPS),
  }));

export const Rapport: React.FC<{ rapport: RapportT; voix: VoiceManifest }> = ({ rapport, voix }) => (
  <Series>
    {calculerDurees(voix).map(({ id, frames, C }) => (
      <Series.Sequence key={id} durationInFrames={frames}>
        <C r={rapport} />
        {voix[id] && <Audio src={staticFile(voix[id]!.fichier)} />}
      </Series.Sequence>
    ))}
  </Series>
);

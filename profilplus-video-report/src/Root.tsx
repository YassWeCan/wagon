import { Composition } from "remotion";
import { Rapport, calculerDurees } from "./Rapport";
import { FPS } from "./theme";
import rapport from "../data/rapport.json";
import voix from "./voice-manifest.json";
import type { Rapport as RapportT, VoiceManifest } from "./types";

export const RemotionRoot = () => {
  const props = { rapport: rapport as unknown as RapportT, voix: voix as VoiceManifest };
  return (
    <Composition
      id="RapportAdherent"
      component={Rapport}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={props}
      calculateMetadata={({ props }) => ({
        durationInFrames: calculerDurees(props.voix).reduce((s, d) => s + d.frames, 0),
      })}
    />
  );
};

import { AbsoluteFill } from "remotion";
import { Fond, useEntree } from "../ui";
import { theme } from "../theme";
import type { Rapport } from "../types";

export const Outro: React.FC<{ r: Rapport }> = ({ r }) => (
  <Fond>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ ...useEntree(0), fontSize: 84, fontWeight: 800 }}>Merci pour votre confiance</div>
      <div style={{ ...useEntree(12), fontSize: 40, color: theme.texteDoux, marginTop: 20 }}>Rendez-vous au prochain trimestre</div>
      <div style={{ ...useEntree(24), fontSize: 44, fontWeight: 800, letterSpacing: 6, color: theme.accent, marginTop: 60 }}>
        PROFIL PLUS · {r.adherent.nom}
      </div>
    </AbsoluteFill>
  </Fond>
);

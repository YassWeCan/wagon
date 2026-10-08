import { AbsoluteFill } from "remotion";
import { Fond, useEntree } from "../ui";
import { theme } from "../theme";
import type { Rapport } from "../types";

export const Intro: React.FC<{ r: Rapport }> = ({ r }) => (
  <Fond>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ ...useEntree(0), fontSize: 44, fontWeight: 800, letterSpacing: 6, color: theme.accent }}>
        PROFIL PLUS
      </div>
      <div style={{ ...useEntree(10), fontSize: 96, fontWeight: 800, margin: "24px 0" }}>{r.adherent.nom}</div>
      <div style={{ ...useEntree(22), fontSize: 40, color: theme.texteDoux }}>
        Bilan digital · {r.adherent.nb_agences} agences
      </div>
      <div style={{ ...useEntree(32), fontSize: 34, color: theme.texteDoux, marginTop: 12 }}>{r.periode.label}</div>
    </AbsoluteFill>
  </Fond>
);

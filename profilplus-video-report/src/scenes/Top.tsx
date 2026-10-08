import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fond, Titre, Compteur } from "../ui";
import { theme } from "../theme";
import { court } from "../format";
import type { Rapport } from "../types";

export const Top: React.FC<{ r: Rapport }> = ({ r }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...r.top.map((a) => a.total), 1);
  return (
    <Fond>
      <Titre sur={`Classement · ${r.adherent.nb_agences} agences`}>Top 10 des agences</Titre>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {r.top.map((a, i) => {
          const p = spring({ frame: f - 15 - i * 5, fps, config: { damping: 200 } });
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 24, opacity: p, height: 54 }}>
              <div style={{ width: 50, fontSize: 32, fontWeight: 800, color: i < 3 ? theme.accent : theme.texteDoux, textAlign: "right" }}>{i + 1}</div>
              <div style={{ width: 380, fontSize: 32, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{court(a.nom)}</div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ height: 36, width: `${(a.total / max) * 85 * p}%`, background: i < 3 ? theme.accent : theme.primaire, borderRadius: "0 6px 6px 0" }} />
                <Compteur valeur={a.total} delai={15 + i * 5} duree={30} style={{ fontSize: 30, fontWeight: 700 }} />
              </div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

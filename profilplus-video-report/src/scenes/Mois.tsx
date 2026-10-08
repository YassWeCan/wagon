import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fond, Titre, Compteur } from "../ui";
import { theme } from "../theme";
import type { Rapport } from "../types";

// Une seule série (contacts / mois) → une seule couleur, valeur écrite au-dessus de chaque barre.
export const Mois: React.FC<{ r: Rapport }> = ({ r }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const valeurs = r.months.map((m) => m.leads + m.rdv + m.devis + m.eresa);
  const max = Math.max(...valeurs, 1);
  const H = 520;
  return (
    <Fond>
      <Titre sur="Mois par mois">Contacts générés</Titre>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 120, marginTop: "auto", height: H + 140 }}>
        {r.months.map((m, i) => {
          const p = spring({ frame: f - 15 - i * 10, fps, config: { damping: 200 } });
          const h = (valeurs[i] / max) * H * p;
          const meilleur = valeurs[i] === max;
          return (
            <div key={m.mois} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 260 }}>
              <Compteur valeur={valeurs[i]} delai={15 + i * 10} duree={40} style={{ fontSize: 52, fontWeight: 800, marginBottom: 14 }} />
              <div
                style={{
                  width: 200, height: h, borderRadius: "8px 8px 0 0",
                  background: meilleur ? theme.accent : theme.primaire,
                  opacity: interpolate(p, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
                }}
              />
              <div style={{ height: 3, width: 260, background: theme.texteDoux, opacity: 0.4 }} />
              <div style={{ fontSize: 36, marginTop: 18, textTransform: "capitalize", color: theme.texteDoux }}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

// Briques visuelles réutilisables (fond, titres, compteurs, badges).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { nombre, pourcent } from "./format";

export const Fond: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 90) * 20;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% 30%, ${theme.fondCarte} 0%, ${theme.fond} 65%)`,
        color: theme.texte,
        fontFamily: theme.police,
        padding: 90,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Apparition douce : glisse de bas en haut + fondu, après `delai` images. */
export const useEntree = (delai = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delai, fps, config: { damping: 200 } });
  return { opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` };
};

export const Titre: React.FC<{ sur?: string; children: React.ReactNode }> = ({ sur, children }) => (
  <div style={useEntree(0)}>
    {sur && (
      <div style={{ color: theme.accent, fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
        {sur}
      </div>
    )}
    <div style={{ fontSize: 72, fontWeight: 800, marginTop: 8 }}>{children}</div>
  </div>
);

/** Nombre qui défile de 0 à `valeur`. */
export const Compteur: React.FC<{ valeur: number; delai?: number; duree?: number; style?: React.CSSProperties }> = ({
  valeur, delai = 0, duree = 45, style,
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [delai, delai + duree], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ease = 1 - Math.pow(1 - t, 3);
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{nombre(valeur * ease)}</span>;
};

/** Badge d'évolution : flèche + signe + couleur (jamais la couleur seule). */
export const Evolution: React.FC<{ valeur: number | null; taille?: number }> = ({ valeur, taille = 30 }) => {
  if (valeur === null) return null;
  const hausse = valeur >= 0;
  const c = hausse ? theme.hausse : theme.baisse;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, fontSize: taille, fontWeight: 700,
        color: theme.texte, background: `${c}33`, border: `2px solid ${c}`, borderRadius: 999, padding: "4px 18px",
      }}
    >
      <span style={{ color: c }}>{hausse ? "▲" : "▼"}</span>
      {pourcent(valeur)}
    </span>
  );
};

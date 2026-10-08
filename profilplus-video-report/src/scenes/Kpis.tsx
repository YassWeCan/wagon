import { Fond, Titre, Compteur, Evolution, useEntree } from "../ui";
import { theme } from "../theme";
import type { Rapport, Kpis as K } from "../types";

const CARTES: { cle: keyof K; label: string }[] = [
  { cle: "leads", label: "Leads" },
  { cle: "rdv", label: "Rendez-vous" },
  { cle: "devis", label: "Devis" },
  { cle: "eresa", label: "E-résa" },
  { cle: "fidelite", label: "Cartes fidélité" },
];

const Carte: React.FC<{ r: Rapport; cle: keyof K; label: string; i: number }> = ({ r, cle, label, i }) => (
  <div
    style={{
      ...useEntree(40 + i * 8), flex: 1, background: theme.fondCarte, borderRadius: 24, padding: "32px 28px",
      borderTop: `6px solid ${cle === "fidelite" ? theme.texteDoux : theme.primaire}`,
    }}
  >
    <div style={{ fontSize: 28, color: theme.texteDoux }}>{label}</div>
    <Compteur valeur={r.totals[cle]} delai={45 + i * 8} style={{ fontSize: 64, fontWeight: 800, display: "block", margin: "10px 0 16px" }} />
    <Evolution valeur={r.evolutions[cle]} taille={24} />
  </div>
);

export const Kpis: React.FC<{ r: Rapport }> = ({ r }) => (
  <Fond>
    <Titre sur="Vue d'ensemble">Contacts générés par le site</Titre>
    <div style={{ ...useEntree(12), display: "flex", alignItems: "center", gap: 40, marginTop: 50 }}>
      <Compteur valeur={r.totals.total} delai={12} duree={60} style={{ fontSize: 170, fontWeight: 900, color: theme.accent }} />
      <div>
        <Evolution valeur={r.evolutions.total} taille={40} />
        <div style={{ fontSize: 26, color: theme.texteDoux, marginTop: 12 }}>vs les 3 mois précédents</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 28, marginTop: "auto" }}>
      {CARTES.map((c, i) => <Carte key={c.cle} r={r} {...c} i={i} />)}
    </div>
  </Fond>
);

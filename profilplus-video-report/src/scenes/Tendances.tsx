import { Fond, Titre, Evolution, useEntree } from "../ui";
import { theme } from "../theme";
import { court, nombre } from "../format";
import type { Agence, Rapport } from "../types";

const Ligne: React.FC<{ a: Agence; i: number; base: number }> = ({ a, i, base }) => (
  <div style={{ ...useEntree(base + i * 7), display: "flex", justifyContent: "space-between", alignItems: "center",
    background: theme.fondCarte, borderRadius: 16, padding: "18px 26px" }}>
    <div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{court(a.nom)}</div>
      <div style={{ fontSize: 22, color: theme.texteDoux }}>{nombre(a.total_prev)} → {nombre(a.total)} contacts</div>
    </div>
    <Evolution valeur={a.evolution} taille={28} />
  </div>
);

const Colonne: React.FC<{ titre: string; icone: string; couleur: string; agences: Agence[]; base: number; vide: string }> = ({
  titre, icone, couleur, agences, base, vide,
}) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ ...useEntree(base - 8), fontSize: 36, fontWeight: 800, borderBottom: `4px solid ${couleur}`, paddingBottom: 12 }}>
      <span style={{ color: couleur }}>{icone}</span> {titre}
    </div>
    {agences.length ? agences.map((a, i) => <Ligne key={a.id} a={a} i={i} base={base} />)
      : <div style={{ fontSize: 28, color: theme.texteDoux }}>{vide}</div>}
  </div>
);

export const Tendances: React.FC<{ r: Rapport }> = ({ r }) => (
  <Fond>
    <Titre sur="Vs les 3 mois précédents">Tendances</Titre>
    <div style={{ display: "flex", gap: 60, marginTop: 40 }}>
      <Colonne titre="Plus fortes progressions" icone="▲" couleur={theme.hausse} agences={r.en_hausse} base={15} vide="Aucune agence en hausse" />
      <Colonne titre={`À surveiller (${r.nb_en_baisse} en recul)`} icone="▼" couleur={theme.baisse} agences={r.en_baisse} base={40} vide="Aucune agence en recul" />
    </div>
  </Fond>
);

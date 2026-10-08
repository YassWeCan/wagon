export type Kpis = { leads: number; rdv: number; devis: number; eresa: number; fidelite: number };
export type Agence = Kpis & {
  id: string; nom: string; ville: string; total: number; total_prev: number; evolution: number | null;
};
export type Rapport = {
  adherent: { nom: string; nb_agences: number };
  periode: { debut: string; fin: string; label: string };
  totals: Kpis & { total: number };
  previous_totals: Kpis & { total: number };
  evolutions: Record<keyof Kpis | "total", number | null>;
  months: (Kpis & { mois: string; label: string })[];
  top: Agence[];
  en_hausse: Agence[];
  en_baisse: Agence[];
  nb_en_baisse: number;
};
export type VoiceManifest = Partial<Record<string, { fichier: string; duree: number }>>;

export const nombre = (x: number) => Math.round(x).toLocaleString("fr-FR").replace(/ | /g, " ");
export const pourcent = (x: number | null) =>
  x === null ? "–" : `${x >= 0 ? "+" : "−"}${Math.abs(Math.round(x * 100))} %`;
export const court = (nom: string) => nom.replace(/^Profil Plus /, "");

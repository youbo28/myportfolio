export interface Competance {
  name: string;
  level: number;
}

export interface CategorizedCompetence {
  category: string;
  competences: Competance[];
}

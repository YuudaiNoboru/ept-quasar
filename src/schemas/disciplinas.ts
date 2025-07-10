import type { Assunto } from 'src/schemas/assuntos';

export interface DisciplinaPublic {
  id: number;
  nome: string;
}

export interface DisciplinaWithAssuntos extends DisciplinaPublic {
  assuntos: Assunto[];
}

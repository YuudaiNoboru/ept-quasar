export interface Assunto {
  id: number;
  nome: string;
  id_assunto_pai: number | null;
  disciplina_id: number;
  subassuntos: Assunto[];
}

export interface AssuntoSemSubassuntosPublic {
  id: number;
  nome: string;
  id_assunto_pai: number | null;
  disciplina_id: number;
}

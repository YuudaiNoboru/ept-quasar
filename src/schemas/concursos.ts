// Importa as interfaces de outros schemas que serão usadas aqui
import type { AssuntoSemSubassuntosPublic } from 'src/schemas/assuntos';
import type { DisciplinaPublic, DisciplinaWithAssuntos } from 'src/schemas/disciplinas';

// Corresponde ao schema ConcursoBase
export interface ConcursoBase {
  nome: string;
  data_prova: string | null; // Datas em TS são geralmente tratadas como strings (ISO format) ou objetos Date
}

// Corresponde ao schema ConcursoPublicList
export interface ConcursoPublicList extends ConcursoBase {
  id: number;
  created_at: string;
  updated_at: string;
}

// Corresponde ao schema ConcursoPublic
export interface ConcursoPublic extends ConcursoBase {
  id: number;
  created_at: string;
  updated_at: string;
  disciplinas: (DisciplinaWithAssuntos | null)[];
}

// Corresponde ao schema ConcursoDisciplinaPublic, usado na página de detalhes
export interface ConcursoDisciplinaPublic extends ConcursoBase {
  id: number;
  created_at: string;
  updated_at: string;
  disciplinas: (DisciplinaPublic | null)[];
}

// Corresponde ao schema ConcursoAssuntoPublic
export interface ConcursoAssuntoPublic extends ConcursoBase {
  id: number;
  created_at: string;
  updated_at: string;
  assuntos: (AssuntoSemSubassuntosPublic | null)[];
}

// Corresponde ao schema ConcursoList (a resposta do endpoint GET /concursos)
export interface ConcursoList {
  concursos: ConcursoPublicList[];
}

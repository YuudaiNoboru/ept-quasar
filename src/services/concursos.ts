import { api } from 'boot/axios';

interface CreateConcursoPayload {
  nome: string;
  data_prova?: string | null;
  disciplinas_ids: number[];
  assuntos_ids: number[];
}

interface UpdateConcursoPayload {
  nome?: string;
  data_prova?: string | null;
  disciplinas_ids?: number[];
  assuntos_ids?: number[];
}

export function getConcursos() {
  return api.get('/api/v1/concursos/');
}

export function createConcurso(concursoData: CreateConcursoPayload) {
  return api.post('/api/v1/concursos/', concursoData);
}

export function getConcursoById(concursoId: number) {
  return api.get(`/api/v1/concursos/${concursoId}`);
}

export function updateConcurso(concursoId: number, concursoData: UpdateConcursoPayload) {
  return api.put(`/api/v1/concursos/${concursoId}`, concursoData);
}

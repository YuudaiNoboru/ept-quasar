import { api } from 'src/boot/axios';

interface CreateDisciplinaPayload {
  nome: string;
}

export function createDisciplina(disciplinaData: CreateDisciplinaPayload) {
  return api.post('/api/v1/disciplinas/', disciplinaData);
}

export function getDisciplinas() {
  return api.get('/api/v1/disciplinas/');
}

export function getDisciplinaComAssuntos(disciplinaId: number) {
  return api.get(`/api/v1/disciplinas/${disciplinaId}/assuntos`);
}

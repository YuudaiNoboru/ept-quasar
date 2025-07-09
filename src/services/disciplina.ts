import { api } from 'src/boot/axios';

interface CreateDisciplinaPayload {
  nome: string;
}

export function createDisciplina(disciplinaData: CreateDisciplinaPayload) {
  return api.post('/api/v1/disciplinas/');
}

export function getDisciplinas() {
  return api.get('/api/v1/disciplinas/');
}

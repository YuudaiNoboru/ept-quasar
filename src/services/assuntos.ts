import { api } from 'boot/axios';

interface CreateAssuntoPayload {
  nome: string;
  disciplina_id: number;
  id_assunto_pai?: number | null;
}

export function createAssunto(assuntoData: CreateAssuntoPayload) {
  return api.post('api/v1/assunto/', assuntoData);
}

export function getAssuntoComSubassuntos(assuntoId: number) {
  return api.get(`/api/v1/assunto/${assuntoId}`);
}

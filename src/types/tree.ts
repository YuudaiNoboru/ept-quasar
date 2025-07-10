export interface Node {
  key: string;
  label: string;
  type: 'disciplina' | 'assunto';
  id: number;
  disciplinaId?: number;
  children?: Node[];
  lazy?: boolean;
  icon?: string;
  tickable?: boolean;
}

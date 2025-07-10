<template>
  <q-page padding>
    <div v-if="loading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else-if="concurso">
      <div class="text-h4">{{ concurso.nome }}</div>
      <div class="text-subtitle1 text-grey" v-if="concurso.data_prova">
        Data da Prova: {{ formatarData(concurso.data_prova) }}
      </div>

      <q-separator class="q-my-lg" />

      <div class="text-h5 q-mb-md">Disciplinas e Assuntos do Edital</div>

      <DisciplinasAssuntosTree
        v-if="nodes.length > 0"
        :nodes="nodes"
        :loading="loading"
        selection="none"
        @lazy-load="handleLazyLoad"
      />
      <div v-else class="text-grey">Nenhuma disciplina ou assunto vinculado a este concurso.</div>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="edit" color="primary">
          <q-tooltip>Editar Concurso</q-tooltip>
        </q-btn>
      </q-page-sticky>
    </div>
    <div v-else class="text-center text-h5 text-negative">Concurso não encontrado.</div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getConcursoById } from 'src/services/concursos';
import { getDisciplinaComAssuntos } from 'src/services/disciplinas';
import { getAssuntoComSubassuntos } from 'src/services/assuntos';
import DisciplinasAssuntosTree from 'src/components/DisciplinasAssuntosTree.vue';

// Importação dos Schemas/Tipos
import type { ConcursoDisciplinaPublic } from 'src/schemas/concursos';
import type { DisciplinaPublic } from 'src/schemas/disciplinas';
import type { Assunto as IAssunto } from 'src/schemas/assuntos';
import type { Node } from 'src/types/tree';

const props = defineProps<{
  id: string;
}>();

const loading = ref(false);
const concurso = ref<ConcursoDisciplinaPublic | null>(null);
const nodes = ref<Node[]>([]);

// --- Funções de Formatação de Dados ---
const formatarDisciplinaParaNode = (disciplina: DisciplinaPublic): Node => ({
  key: `disciplina_${disciplina.id}`,
  label: disciplina.nome,
  id: disciplina.id,
  type: 'disciplina',
  icon: 'school',
  lazy: true, // Importante: Marca a disciplina para carregar os assuntos depois
  tickable: false,
});

const formatarAssuntoParaNode = (assunto: IAssunto, disciplinaId: number): Node => {
  const temFilhos = assunto.subassuntos && assunto.subassuntos.length > 0;
  return {
    key: `assunto_${assunto.id}`,
    label: assunto.nome,
    id: assunto.id,
    type: 'assunto',
    disciplinaId,
    icon: temFilhos ? 'folder' : 'article',
    lazy: true, // Todo assunto também pode ser expandido
    tickable: false,
    children: temFilhos
      ? assunto.subassuntos.map((sub) => formatarAssuntoParaNode(sub, disciplinaId))
      : [],
  };
};

function formatarData(data: string | null): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Lida com o evento de lazy-load emitido pelo componente da árvore.
 */
async function handleLazyLoad({
  node,
  done,
  fail,
}: {
  node: Node;
  done: (children: Node[]) => void;
  fail: () => void;
}) {
  try {
    let children: Node[] = [];
    if (node.type === 'disciplina') {
      const response = await getDisciplinaComAssuntos(node.id);
      children = response.data.assuntos.map((assunto: IAssunto) =>
        formatarAssuntoParaNode(assunto, node.id),
      );
    } else if (node.type === 'assunto') {
      const response = await getAssuntoComSubassuntos(node.id);
      children = response.data.subassuntos.map((sub: IAssunto) =>
        formatarAssuntoParaNode(sub, node.disciplinaId!),
      );
    }
    done(children);
  } catch (error) {
    console.error('Falha ao carregar filhos do nó:', error);
    fail();
  }
}

async function carregarDetalhesConcurso() {
  loading.value = true;
  try {
    const concursoId = parseInt(props.id, 10);
    const response = await getConcursoById(concursoId);
    concurso.value = response.data;

    // Formata apenas as disciplinas de primeiro nível. Os assuntos serão carregados com o lazy-load.
    if (concurso.value && concurso.value.disciplinas) {
      const disciplinasValidas = concurso.value.disciplinas.filter(
        (d): d is DisciplinaPublic => d !== null,
      );
      nodes.value = disciplinasValidas.map(formatarDisciplinaParaNode);
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do concurso:', error);
    concurso.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void carregarDetalhesConcurso();
});
</script>

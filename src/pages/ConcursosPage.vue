<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Meus Concursos</div>

    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner color="primary" size="3em" />
    </div>
    <div v-else-if="concursos.length === 0" class="text-center text-grey">
      Nenhum concurso encontrado. Crie o seu primeiro!
    </div>
    <div v-else class="q-gutter-md">
      <router-link
        v-for="concurso in concursos"
        :key="concurso.id"
        :to="{ name: 'concurso-detalhes', params: { id: concurso.id } }"
        class="text-primary"
        style="text-decoration: none"
      >
        <q-card bordered class="cursor-pointer">
          <q-card-section>
            <div class="text-h6">{{ concurso.nome }}</div>
            <div v-if="concurso.data_prova" class="text-caption text-grey">
              Data da Prova: {{ formatarData(concurso.data_prova) }}
            </div>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab @click="abrirDialogoNovoConcurso" icon="add" direction="up" color="primary" />
    </q-page-sticky>

    <q-dialog v-model="mostrarDialogo" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Novo Concurso</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="handleCriarConcurso">
          <q-card-section class="q-pt-none">
            <q-input
              v-model="form.nome"
              label="Nome do Concurso"
              autofocus
              class="q-mb-md"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'O nome é obrigatório.']"
            />
            <q-input v-model="form.data_prova" mask="date" label="Data da Prova (Opcional)">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.data_prova" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Selecione as Disciplinas e Assuntos</div>
            <DisciplinasAssuntosTree
              :nodes="nodesSelecao"
              :loading="loadingTree"
              selection="cascade"
              @update:ticked="onTickedNodesUpdate"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Salvar Concurso" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { createConcurso, getConcursos } from 'src/services/concursos';
import { getDisciplinas, getDisciplinaComAssuntos } from 'src/services/disciplinas';
import DisciplinasAssuntosTree from 'src/components/DisciplinasAssuntosTree.vue';
import type { ConcursoPublicList } from 'src/schemas/concursos';
import type { Node } from 'src/types/tree';
import type { Assunto as IAssunto } from 'src/schemas/assuntos';

// --- Estado da Página ---
const $q = useQuasar();
const loading = ref(false);
const concursos = ref<ConcursoPublicList[]>([]);
const mostrarDialogo = ref(false);
const form = reactive({ nome: '', data_prova: '' });

// Estado para a árvore dentro do diálogo
const loadingTree = ref(false);
const nodesSelecao = ref<Node[]>([]);
const tickedNodeKeys = ref<string[]>([]);

// --- Funções ---
function formatarData(data: string | null): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

async function carregarConcursos() {
  loading.value = true;
  try {
    const response = await getConcursos();
    concursos.value = response.data.concursos;
  } finally {
    loading.value = false;
  }
}

// Lógica de formatação para a árvore de seleção
const formatarAssuntosRecursivo = (assuntos: IAssunto[]): Node[] => {
  return assuntos.map((assunto) => ({
    key: `assunto_${assunto.id}`,
    label: assunto.nome,
    id: assunto.id,
    type: 'assunto',
    tickable: true,
    icon: assunto.subassuntos && assunto.subassuntos.length > 0 ? 'folder' : 'article',
    children: formatarAssuntosRecursivo(assunto.subassuntos),
  }));
};

async function carregarDadosParaSelecao() {
  loadingTree.value = true;
  nodesSelecao.value = [];
  try {
    const { data: disciplinasResponse } = await getDisciplinas();
    const disciplinasCompletas: Node[] = [];
    for (const disciplina of disciplinasResponse.disciplinas) {
      const { data: discComAssuntos } = await getDisciplinaComAssuntos(disciplina.id);
      disciplinasCompletas.push({
        key: `disciplina_${disciplina.id}`,
        label: disciplina.nome,
        id: disciplina.id,
        type: 'disciplina',
        icon: 'school',
        tickable: discComAssuntos.assuntos.length > 0,
        children: formatarAssuntosRecursivo(discComAssuntos.assuntos),
      });
    }
    nodesSelecao.value = disciplinasCompletas;
  } finally {
    loadingTree.value = false;
  }
}

function abrirDialogoNovoConcurso() {
  form.nome = '';
  form.data_prova = '';
  tickedNodeKeys.value = [];
  mostrarDialogo.value = true;
  void carregarDadosParaSelecao();
}

function onTickedNodesUpdate(keys: string[]) {
  tickedNodeKeys.value = keys;
}

async function handleCriarConcurso() {
  const assuntos_ids = tickedNodeKeys.value
    .map((key) => {
      const parts = key.split('_');
      if (parts[0] === 'assunto' && parts[1]) {
        return parseInt(parts[1], 10);
      }
      return null;
    })
    .filter((id): id is number => id !== null);

  if (assuntos_ids.length === 0) {
    $q.notify({
      color: 'warning',
      icon: 'warning',
      message: 'Selecione pelo menos um assunto para o concurso.',
    });
    return;
  }

  const payload = {
    nome: form.nome,
    data_prova: form.data_prova ? form.data_prova.replace(/\//g, '-') : null,
    disciplinas_ids: [],
    assuntos_ids: assuntos_ids,
  };

  $q.loading.show({ message: 'Salvando concurso...' });
  try {
    await createConcurso(payload);
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'Concurso criado com sucesso!' });
    mostrarDialogo.value = false;
    void carregarConcursos();
  } finally {
    $q.loading.hide();
  }
}

onMounted(() => {
  void carregarConcursos();
});
</script>

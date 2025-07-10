<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Disciplinas e Assuntos</div>

    <DisciplinasAssuntosTree
      ref="treeComponent"
      :nodes="nodes"
      :loading="loading"
      selection="none"
      @update:selectedNode="onNodeSelected"
      @lazy-load="handleLazyLoad"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab icon="add" direction="up" color="primary" vertical-actions-align="right">
        <q-fab-action
          @click="abrirDialogo('disciplina')"
          icon="school"
          color="primary"
          label="Nova Disciplina"
        />
        <q-fab-action
          @click="abrirDialogo('assunto')"
          :disable="!podeAdicionarAssunto"
          icon="topic"
          color="secondary"
          label="Novo Assunto/Subassunto"
        />
      </q-fab>
    </q-page-sticky>

    <q-dialog v-model="mostrarDialogo">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ dialogo.titulo }}</div>
          <div v-if="dialogo.itemPai" class="text-caption">
            Adicionando em: {{ dialogo.itemPai.label }}
          </div>
        </q-card-section>
        <q-form @submit.prevent="handleSalvar">
          <q-card-section>
            <q-input
              v-model="form.nome"
              :label="dialogo.label"
              autofocus
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'O nome é obrigatório.']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Salvar" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  createDisciplina,
  getDisciplinas,
  getDisciplinaComAssuntos,
} from 'src/services/disciplinas';
import { createAssunto, getAssuntoComSubassuntos } from 'src/services/assuntos';
import DisciplinasAssuntosTree from 'src/components/DisciplinasAssuntosTree.vue';
import type { Node } from 'src/types/tree';
import type { DisciplinaPublic } from 'src/schemas/disciplinas';
import type { Assunto as IAssunto } from 'src/schemas/assuntos';

// --- Estado da Página ---
const $q = useQuasar();
const loading = ref(false);
const nodes = ref<Node[]>([]); // A página agora controla os nós da árvore
const selectedNode = ref<Node | null>(null);
const mostrarDialogo = ref(false);
const form = reactive({ nome: '' });
const dialogo = reactive({
  tipo: 'disciplina' as 'disciplina' | 'assunto',
  titulo: '',
  label: '',
  itemPai: null as Node | null,
});

const podeAdicionarAssunto = computed(() => !!selectedNode.value);

// --- Funções de Formatação de Dados ---
const formatarDisciplinaParaNode = (disciplina: DisciplinaPublic): Node => ({
  key: `disciplina_${disciplina.id}`,
  label: disciplina.nome,
  id: disciplina.id,
  type: 'disciplina',
  icon: 'school',
  lazy: true,
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
    lazy: !temFilhos,
    tickable: true,
    children: temFilhos
      ? assunto.subassuntos.map((sub) => formatarAssuntoParaNode(sub, disciplinaId))
      : [],
  };
};

// --- Funções de Lógica da Página ---
async function recarregarArvore() {
  loading.value = true;
  try {
    const response = await getDisciplinas();
    nodes.value = response.data.disciplinas.map(formatarDisciplinaParaNode);
  } finally {
    loading.value = false;
  }
}

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
    // CORREÇÃO: Usa a variável 'error' para corrigir o aviso do ESLint.
    console.error('Falha ao carregar dados da árvore:', error);
    fail();
  }
}

function onNodeSelected(node: Node | null) {
  selectedNode.value = node;
}

function abrirDialogo(tipo: 'disciplina' | 'assunto') {
  form.nome = '';
  dialogo.tipo = tipo;
  dialogo.itemPai = tipo === 'disciplina' ? null : selectedNode.value;
  dialogo.titulo =
    tipo === 'disciplina' ? 'Criar Nova Disciplina' : 'Criar Novo Assunto/Subassunto';
  dialogo.label = tipo === 'disciplina' ? 'Nome da Disciplina' : 'Nome do Assunto';
  mostrarDialogo.value = true;
}

async function handleSalvar() {
  $q.loading.show({ message: 'Salvando...' });
  try {
    if (dialogo.tipo === 'disciplina') {
      await createDisciplina({ nome: form.nome });
    } else if (dialogo.itemPai) {
      const pai = dialogo.itemPai;
      await createAssunto({
        nome: form.nome,
        disciplina_id: pai.type === 'disciplina' ? pai.id : pai.disciplinaId!,
        id_assunto_pai: pai.type === 'assunto' ? pai.id : null,
      });
    }
    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: `${dialogo.tipo.charAt(0).toUpperCase() + dialogo.tipo.slice(1)} criado com sucesso!`,
    });
    mostrarDialogo.value = false;
    // CORREÇÃO: Em vez de chamar uma função do filho, chama a função local.
    await recarregarArvore();
  } finally {
    $q.loading.hide();
  }
}

onMounted(() => {
  void recarregarArvore();
});
</script>

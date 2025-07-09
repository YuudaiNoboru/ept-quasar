<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Minhas Disciplinas</div>
      <q-btn
        @click="abrirDialogoNovaDisciplina"
        label="Nova Disciplina"
        color="primary"
        icon="add"
      />
    </div>

    <q-table
      :rows="disciplinas"
      :columns="colunas"
      row-key="id"
      :loading="loading"
      no-data-label="Nenhuma disciplina encontrada. Que tal criar a primeira?"
    >
    </q-table>

    <q-dialog v-model="mostrarDialogo">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Criar Nova Disciplina</div>
        </q-card-section>

        <q-form @submit.prevent="handleCriarDisciplina">
          <q-card-section>
            <q-input
              v-model="form.nome"
              label="Nome da Disciplina"
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
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { createDisciplina, getDisciplinas } from 'src/services/disciplina';

// Definição da interface para o objeto de disciplina
interface Disciplina {
  id: number;
  nome: string;
}

const $q = useQuasar();

// Estado reativo
const disciplinas = ref<Disciplina[]>([]);
const loading = ref(false);
const mostrarDialogo = ref(false);
const form = reactive({
  nome: '',
});

// Colunas da tabela
const colunas = [
  { name: 'nome', label: 'Nome da Disciplina', field: 'nome', align: 'left', sortable: true },
  // Pode adicionar mais colunas aqui, como 'total_assuntos', etc.
];

/**
 * Busca as disciplinas da API e preenche a tabela.
 */
async function carregarDisciplinas() {
  loading.value = true;
  try {
    const response = await getDisciplinas();
    disciplinas.value = response.data.disciplinas;
  } finally {
    loading.value = false;
  }
}

/**
 * Abre o diálogo para adicionar uma nova disciplina.
 */
function abrirDialogoNovaDisciplina() {
  form.nome = ''; // Limpa o formulário
  mostrarDialogo.value = true;
}

/**
 * Lida com a submissão do formulário de criação.
 */
async function handleCriarDisciplina() {
  $q.loading.show({ message: 'Salvando...' });
  try {
    await createDisciplina({ nome: form.nome });

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: 'Disciplina criada com sucesso!',
    });

    mostrarDialogo.value = false; // Fecha o diálogo
    await carregarDisciplinas(); // Recarrega a lista para mostrar a nova disciplina
  } finally {
    $q.loading.hide();
  }
}

// Carrega as disciplinas quando o componente é montado
onMounted(() => {
  carregarDisciplinas();
});
</script>

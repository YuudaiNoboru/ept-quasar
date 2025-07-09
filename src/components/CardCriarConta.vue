<template>
  <div>
    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="OnSubmit" class="column q-gutter-lg">
          <q-input
            v-model="form.nome"
            label="Nome"
            :rules="[(val) => !!val || 'Forneça um nome válido.']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input
            v-model="form.email"
            label="E-mail"
            type="email"
            :rules="[(val) => !!val || 'Forneça um e-mail válido.']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            v-model="form.senha"
            label="Senha"
            :rules="[(val) => !!val || 'Forneça uma senha válida.']"
            :type="visibility.senha ? 'password' : 'text'"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="visibility.senha ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="visibility.senha = !visibility.senha"
              />
            </template>
          </q-input>
          <q-input
            v-model="form.senhaRepetida"
            label="Repita sua senha"
            :rules="[
              (val) => val === form.senha || 'As senha precisam ser iguais.',
              (val) => !!val || 'Forneça uma senha válida.',
            ]"
            :type="visibility.senhaRepetida ? 'password' : 'text'"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="visibility.senhaRepetida ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="visibility.senhaRepetida = !visibility.senhaRepetida"
              />
            </template>
          </q-input>
          <div class="row justify-end">
            <q-btn label="Criar Conta" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { createUser } from 'src/services/user';
import { useQuasar } from 'quasar';

const emit = defineEmits(['contaCriada']);

const $q = useQuasar();
const form = reactive({
  nome: '',
  email: '',
  senha: '',
  senhaRepetida: '',
});

const visibility = reactive({
  senha: true,
  senhaRepetida: true,
});

async function OnSubmit() {
  $q.loading.show({ message: 'Criando sua conta...' });

  try {
    const payload = {
      username: form.nome,
      email: form.email,
      password: form.senha,
    };

    const response = await createUser(payload);

    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'check_circle',
      message: `Usuário ${response.data.username} criado com sucesso!`,
    });

    emit('contaCriada');

    form.nome = '';
    form.email = '';
    form.senha = '';
    form.senhaRepetida = '';
  } catch (error) {
    console.error('Login falhou:', error);
  } finally {
    $q.loading.hide();
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>

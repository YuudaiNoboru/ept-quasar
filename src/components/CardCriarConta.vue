<template>
  <div>
    <q-card class="my-card">
      <q-card-section>
        <q-form class="column q-gutter-lg">
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
            <q-btn label="Submit" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue';

export default {
  setup() {
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

    return { form, visibility };
  },
};
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>

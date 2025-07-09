<script setup lang="ts">
import { ref } from 'vue';
import CardLogin from '../components/CardLogin.vue';
import CardCriarConta from '../components/CardCriarConta.vue';

const tab = ref('login');

function irParaLogin() {
  tab.value = 'login';
}
</script>

<template>
  <div class="q-pa-md row justify-center">
    <div class="q-gutter-y-md col-grow" style="max-width: 600px">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="login" label="Login" />
          <q-tab name="criar-conta" label="Criar Conta" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="login">
            <CardLogin />
          </q-tab-panel>

          <q-tab-panel name="criar-conta">
            <CardCriarConta @contaCriada="irParaLogin" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

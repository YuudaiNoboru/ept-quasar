<script lang="ts">
import { ref } from 'vue';
import CardLogin from '../components/CardLogin.vue';
import CardCriarConta from '../components/CardCriarConta.vue';

export default {
  components: {
    CardLogin,
    CardCriarConta,
  },
  setup() {
    return {
      tab: ref('login'),
    };
  },
};
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
          <q-tab name="alarms" label="Criar Conta" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="login">
            <CardLogin />
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <CardCriarConta />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

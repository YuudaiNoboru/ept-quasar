<template>
  <div>
    <q-card class="my-card">
      <q-card-section>
        <q-form class="collum q-gutter-lg">
          <q-input
            v-model="email"
            label="E-mail"
            type="email"
            :rules="[(val) => !!val || 'Forneça um e-mail válido.']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            v-model="senha"
            label="Senha"
            :rules="[(val) => !!val || 'Forneça uma senha válida.']"
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
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
import { ref } from 'vue';

export default {
  setup() {
    return {
      senha: ref(''),
      isPwd: ref(true),
      email: ref(''),
    };
  },
};
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>

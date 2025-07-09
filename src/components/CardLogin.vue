<template>
  <div>
    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="handleLoginSubmit" class="collum q-gutter-lg">
          <q-input
            v-model="form.email"
            label="E-mail"
            type="email"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Forneça um e-mail válido.']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            v-model="form.senha"
            label="Senha"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Forneça uma senha válida.']"
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
            <q-btn label="Entrar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { login } from 'src/services/auth';
import { useAuthStore } from 'src/stores/authStore';

const authStore = useAuthStore();

const emit = defineEmits(['login-sucesso']);

const $q = useQuasar();
const isPwd = ref(true);

const form = reactive({
  email: '',
  senha: '',
});

async function handleLoginSubmit() {
  $q.loading.show({ message: 'Entrando...' });

  try {
    const response = await login({
      email: form.email,
      password: form.senha,
    });

    const accesToken = response.data.access_token;
    console.log('Login bem-sucedido! Token:', accesToken);
    authStore.setToken(accesToken);
    console.log('Token armazenado com sucesso: Token - ', authStore.token);

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: 'Login realizado com sucesso!',
    });

    emit('login-sucesso', accesToken);
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

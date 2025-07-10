import { defineBoot } from '#q-app/wrappers';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { Notify } from 'quasar';

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = 'Ocorreu um erro de comunicação com o servidor.';

    if (error.response) {
      const erroData = error.response.data as {
        detail?: string | { loc: (string | number)[]; msg: string; type: string }[];
      };

      if (typeof erroData.detail === 'string') {
        errorMessage = erroData.detail;
      } else if (Array.isArray(erroData.detail)) {
        const validationErrors = erroData.detail.map((e) => e.msg).join(', ');
        errorMessage = `Dados inválidos: ${validationErrors}`;
      }
    } else if (error.request) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua internet.';
    }

    Notify.create({
      color: 'negative',
      position: 'top',
      icon: 'report_problem',
      message: errorMessage,
    });

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axios, api };

import { defineStore, acceptHMRUpdate } from 'pinia';

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    token: localStorage.getItem('authToken'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(newToken: string) {
      localStorage.setItem('authToken', newToken);
      this.token = newToken;
    },
    logout() {
      localStorage.removeItem('authToken');
      this.token = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}

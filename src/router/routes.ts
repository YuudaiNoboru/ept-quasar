import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/BemVindo.vue') },
      {
        path: 'disciplinas',
        name: 'disciplinas',
        component: () => import('pages/DisciplinasPage.vue'),
      },
      { path: 'concursos', name: 'concursos', component: () => import('pages/ConcursosPage.vue') },
      {
        path: 'concursos/:id', // O ':id' torna a rota dinâmica
        name: 'concurso-detalhes',
        component: () => import('pages/ConcursoDetalhePage.vue'),
        props: true, // Passa os parâmetros da rota (como o ID) como props para o componente
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

<template>
  <q-card flat bordered>
    <q-card-section>
      <q-tree
        :nodes="nodes"
        v-model:selected="selectedKey"
        v-model:expanded="expandedKeys"
        v-model:ticked="tickedKeys"
        :tick-strategy="tickStrategy"
        @lazy-load="onLazyLoad"
        node-key="key"
        children-key="children"
        no-nodes-label="Nenhuma disciplina cadastrada."
      >
        <template v-slot:default-header="props">
          <div class="row items-center q-gutter-sm">
            <q-icon
              :name="props.node.icon"
              :color="selectedKey === props.node.key ? 'primary' : 'grey-7'"
              size="20px"
            />
            <span>{{ props.node.label }}</span>
          </div>
        </template>
      </q-tree>
      <q-inner-loading :showing="loading" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import type { Node } from 'src/types/tree';

// --- Props & Emits ---
const props = defineProps<{
  nodes: Node[];
  loading: boolean;
  selection?: 'none' | 'leaf' | 'cascade';
  initialTicked?: string[];
}>();

const emit = defineEmits(['lazy-load', 'update:ticked', 'update:selectedNode']);

// --- Estado Reativo ---
const selectedKey = ref<string | null>(null);
const expandedKeys = ref<string[]>([]);
const tickedKeys = ref<string[]>(props.initialTicked || []);
const isUpdatingInternally = ref(false);

// --- Lógica Computada ---
const tickStrategy = computed(() => {
  // A estratégia 'strict' permite que o nosso watcher tenha controlo total.
  return props.selection === 'none' ? 'none' : 'strict';
});

// --- Funções Auxiliares ---
const findNode = (nodesArray: Node[], key: string): Node | null => {
  for (const node of nodesArray) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

const findParentNode = (nodesArray: Node[], childKey: string): Node | null => {
  for (const node of nodesArray) {
    if (node.children?.some((child) => child.key === childKey)) {
      return node;
    }
    if (node.children) {
      const found = findParentNode(node.children, childKey);
      if (found) return found;
    }
  }
  return null;
};

const getAllDescendantKeys = (node: Node): string[] => {
  return node.children?.flatMap((child) => [child.key, ...getAllDescendantKeys(child)]) ?? [];
};

// --- Observador Principal para a Lógica de Seleção ---
watch(tickedKeys, (newValue, oldValue) => {
  if (isUpdatingInternally.value || props.selection !== 'cascade') {
    emit('update:ticked', newValue);
    return;
  }

  const newTickedSet = new Set(newValue);
  const oldTickedSet = new Set(oldValue);

  let changedKey: string | null = null;
  const added = newValue.length > oldValue.length;

  if (added) {
    for (const key of newTickedSet) {
      if (!oldTickedSet.has(key)) {
        changedKey = key;
        break;
      }
    }
  } else {
    for (const key of oldTickedSet) {
      if (!newTickedSet.has(key)) {
        changedKey = key;
        break;
      }
    }
  }

  if (!changedKey) return;

  const node = findNode(props.nodes, changedKey);
  if (!node) return;

  // Lógica de Cascata para Baixo (Pai -> Filhos)
  const descendants = getAllDescendantKeys(node);
  if (added) {
    descendants.forEach((key) => newTickedSet.add(key));
  } else {
    descendants.forEach((key) => newTickedSet.delete(key));
  }

  // Lógica de Cascata para Cima (Filhos -> Pai)
  updateAllParentsState(changedKey, newTickedSet);

  isUpdatingInternally.value = true;
  tickedKeys.value = Array.from(newTickedSet);

  void nextTick(() => {
    isUpdatingInternally.value = false;
  });
});

function updateAllParentsState(childKey: string, tickedSet: Set<string>) {
  const parent = findParentNode(props.nodes, childKey);
  if (!parent || !parent.tickable) return;

  const allChildrenTicked = parent.children?.every((child) => tickedSet.has(child.key));

  if (allChildrenTicked) {
    tickedSet.add(parent.key);
  } else {
    tickedSet.delete(parent.key);
  }

  // Continua a subir na árvore recursivamente
  updateAllParentsState(parent.key, tickedSet);
}

watch(selectedKey, (newKey) => {
  const node = newKey ? findNode(props.nodes, newKey) : null;
  emit('update:selectedNode', node);
});

function onLazyLoad(details: { node: Node; done: (children: Node[]) => void; fail: () => void }) {
  emit('lazy-load', details);
}
</script>

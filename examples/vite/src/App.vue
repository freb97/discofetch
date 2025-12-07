<script setup lang="ts">
import { dfetch } from 'discofetch'
import { ref } from 'vue'

const todo = ref()

async function fetchTodo() {
  const { data } = await dfetch.GET('/todos/{id}', {
    params: {
      path: { id: 1 },
    },
  })

  todo.value = data
}
</script>

<template>
  <div>
    <button @click="fetchTodo">
      Fetch Todo
    </button>

    <pre>{{ todo }}</pre>
  </div>
</template>

<script setup lang="ts">
import { dfetch } from 'discofetch/client'
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

fetchTodo()
</script>

<template>
  <div>
    <pre>{{ todo }}</pre>
  </div>
</template>

<template>
  <div class="wrap">
    hello page1
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import './test'
export default defineComponent({
  name: 'App',
  setup() {
    console.log(import.meta.env)
  }
})
</script>

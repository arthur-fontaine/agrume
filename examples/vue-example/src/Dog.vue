<script setup lang="ts">
import { getDogImage } from './get-dog-image'
import { ref, onMounted } from 'vue'

const dogImage = ref('')

onMounted(async () => {
  dogImage.value = await getDogImage()
})
</script>

<template>
  <div>
    <img :src="dogImage" />
  </div>
</template>

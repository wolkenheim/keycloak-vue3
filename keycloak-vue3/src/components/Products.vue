<script setup lang="ts">
import {axiosInstance} from '@/axios'
const fetch = async () => {
  await axiosInstance.get("/products")
}
</script>

<template>
 <div>
   <button @click="fetch">Fetch Products</button>
 </div>
</template>

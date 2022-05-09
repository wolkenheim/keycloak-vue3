<script setup lang="ts">
import {useUserStore} from "@/keycloak/user";
const userStore = useUserStore();
</script>

<template>
  <div id="topbar">
    <div>
      <span>Welcome back, {{ userStore?.user?.username }}. </span>
      <span>Your roles are: {{ userStore?.roles.toString() }} </span>
    </div>
  </div>
</template>
<style>
#topbar {
  margin-bottom: 1rem;
  border-bottom: 1px solid #282828;
}
</style>


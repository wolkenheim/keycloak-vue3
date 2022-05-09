<script setup lang="ts">
import {useUserStore} from "@/keycloak/user";
import {computed} from "vue";

const userStore = useUserStore();

const userName = computed<string>(() => {
  return userStore?.user?.username ?? ""
})
const userRoles = computed<string>(() => {
  return userStore?.roles.toString()
})
</script>

<template>
  <div id="topbar">
    <div>
      <span>Welcome back, {{ userName }}. </span>
      <span>Your roles are: {{ userRoles }} </span>
    </div>
  </div>
</template>
<style>
#topbar {
  margin-bottom: 1rem;
  border-bottom: 1px solid #282828;
}
</style>


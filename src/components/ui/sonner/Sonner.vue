<script setup lang="ts">
import { Toaster as SonnerToaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>

<template>
  <SonnerToaster position="top-center" :toast-options="{ class: 'toast-theme' }" />
</template>

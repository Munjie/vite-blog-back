<template>
    <MdPreview :id="id" :modelValue="text" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import  MdPreview  from 'md-editor-v3';
import "md-editor-v3/lib/style.css";

const id = 'preview-only';
const text = ref('# Hello Editor');
</script>
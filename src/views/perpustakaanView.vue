<template>
    <div>
        <navbar />
        <h1 align="center" class="title">Selamat Datang di Management Perpustakaan</h1>
        <Siswa />
    </div>
</template>

<script setup>
import navbar from '@/components/navbar.vue';
import Siswa from '@/components/perpustakaan/siswa.vue';
</script>

<style scoped>

table {
    width: 80%;
}

</style>

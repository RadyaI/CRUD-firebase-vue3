<template>
    <div>
        <navbar />
        <h1 align="center" class="title">Selamat Datang di Management Perpustakaan</h1>
        <div class="menu">
            <div class="menu-list" @click="state.currentDisplay = 'member'" :class="{ 'selected': state.currentDisplay == 'member' }">Member</div>
            <div class="menu-list" @click="state.currentDisplay = 'buku'" :class="{ 'selected': state.currentDisplay == 'buku' }">Buku</div>
            <div class="menu-list" @click="state.currentDisplay = 'pinjam'" :class="{ 'selected': state.currentDisplay == 'pinjam' }">Peminjaman</div>
        </div>
        <Siswa v-if="state.currentDisplay == 'member'" />
        <Buku v-if="state.currentDisplay == 'buku'" />
    </div>
</template>

<script setup>
import navbar from '@/components/navbar.vue';
import Buku from '@/components/perpustakaan/buku.vue';
import Siswa from '@/components/perpustakaan/siswa.vue';
import { reactive } from 'vue';

const state = reactive({
    currentDisplay: 'buku'
})

</script>

<style scoped>
table {
    width: 80%;
}
</style>

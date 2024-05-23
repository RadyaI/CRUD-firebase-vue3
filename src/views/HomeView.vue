<template>
  <div>
    <h1 align="center" class="title">Selamat Datang di Management Sekolah</h1>
    <div class="menu">
      <div @click="currentDisplay = 'siswa'" class="menu-list" :class="{ 'selected': currentDisplay === 'siswa' }">Siswa
      </div>
      <div @click="currentDisplay = 'sarpra'" class="menu-list" :class="{ 'selected': currentDisplay === 'sarpra' }">
        Sarpra
      </div>
      <div @click="currentDisplay = 'kelas'" class="menu-list" :class="{ 'selected': currentDisplay === 'kelas' }">Kelas
      </div>
    </div>

    <kelasView v-if="currentDisplay === 'kelas'" />
    <siswa v-if="currentDisplay === 'siswa'" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import kelasView from '@/components/kelas.vue'
import siswa from '@/components/siswa.vue'

let currentDisplay = ref('siswa')
</script>

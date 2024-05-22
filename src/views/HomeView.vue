<template>
  <div>
    <h1 align="center" class="title">Selamat Datang di Management Sekolah</h1>
    <div class="menu">
      <div @click="currentDisplay = 'siswa'" class="menu-list" :class="{ 'selected': currentDisplay === 'siswa' }">Siswa
      </div>
      <div @click="currentDisplay = 'guru'" class="menu-list" :class="{ 'selected': currentDisplay === 'guru' }">Guru
      </div>
      <div @click="currentDisplay = 'kelas'" class="menu-list" :class="{ 'selected': currentDisplay === 'kelas' }">Kelas
      </div>
    </div>

    <kelasView v-if="currentDisplay == 'kelas'" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import kelasView from '@/components/kelas.vue'


let currentDisplay = ref('kelas')
</script>

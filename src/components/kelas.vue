<template>
  <div>
    <div class="kelas-container">
      <div class="kelas-wrapper">
        <button class="btn-kelas-tambah" @click="state.toggleModal = true">Tambah</button>
        <select placeholder="Filter Kelas" class="filter-form" v-model="state.filter">
          <option value="">Semua Kelas</option>
          <option value="10">Kelas 10</option>
          <option value="11">Kelas 11</option>
          <option value="12">Kelas 12</option>
        </select>
        <table class="animate__animated animate__fadeInUp">
          <thead>
            <tr>
              <th>No</th>
              <th>Tingkat</th>
              <th>Jurusan</th>
              <th>Ruangan</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, no) in filterData" :key="no">
              <td>{{ no + 1 }}</td>
              <td>{{ i.tingkat }}</td>
              <td>{{ i.jurusan }}</td>
              <td>{{ i.ruangan }}</td>
              <td>
                <button class="btn-kelas-edit">EDIT</button>
                <button class="btn-kelas-hapus" @click="deleteKelas(i)">HAPUS</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL AREA -->
    <div class="modal" v-if="state.toggleModal === true">
      <div
        class="modal-body animate__animated animate__backInDown"
        :class="{ animate__backOutUp: state.closeModal }"
      >
        <form @submit.prevent="sendData">
          Tingkat/Kelas:<br />
          <input
            v-model="state.form.tingkat"
            required
            type="number"
            class="form-modal"
            placeholder="Masukkan Kelas/Tingkat..."
          />
          <br />
          Jurusan: <br />
          <select v-model="state.form.jurusan" required class="form-modal">
            <option value="-">-</option>
            <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
            <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
            <option value="Pengembangan Game">Pengembangan Game</option>
          </select>
          <br />
          Ruangan: <br />
          <input
            v-model="state.form.ruangan"
            required
            type="number"
            class="form-modal"
            placeholder="Masukkan nomor ruangan..."
          />
          <br />
          <input type="submit" class="form-submit" value="Submit" />
        </form>
        <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
      </div>
    </div>
    <!-- MODAL AREA -->
  </div>
</template>

<script>
import "animate.css";
import { reactive, onMounted, computed } from "vue";

import { db } from "@/firebase.js";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  collection,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import swal from "sweetalert";

export default {
  name: "app",
  setup() {
    const state = reactive({
      filter: "",
      toggleModal: false,
      closeModal: false,
      form: {
        time: Timestamp.now().toMillis(),
      },
      kelasData: [],
    });

    const closeModal = () => {
      state.closeModal = true;
      console.log({ closeOn: state.closeModal });
      setTimeout(() => {
        state.toggleModal = false;
        state.closeModal = false;
        console.log({ closeOn: state.closeModal });
      }, 1200);
    };

    const sendData = async () => {
      try {
        await addDoc(collection(db, "kelas"), state.form);
        swal({
          icon: "success",
          title: false,
          text: false,
          button: false,
          timer: 1000,
        });
        closeModal();
      } catch (error) {
        console.log(error);
      }
    };

    const getData = () => {
      try {
        onSnapshot(query(collection(db, "kelas"), orderBy("time", "asc")), (snapshot) => {
          state.kelasData = [];
          snapshot.forEach((data) => {
            const kelas = data.data();
            state.kelasData.push({ ...kelas, id: data.id });
          });
        });
      } catch (error) {
        console.log(error);
      }
    };

    const deleteKelas = async (i) => {
      try {
        const alert = await swal({
          icon: "warning",
          title: "Hapus?",
          buttons: ["Tidak", "Iya"],
          dangerMode: true,
        });
        if (alert) {
          await deleteDoc(doc(db, "kelas", i.id));
          swal({
            icon: "success",
            button: false,
            timer: 1000,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    onMounted(() => {
      getData();
    });

    const filterData = computed(() => {
      let filtered = state.kelasData;
      if (state.filter) {
        filtered = filtered.filter((i) => i.tingkat == state.filter);
      }
      return filtered;
    });

    return {
      state,
      closeModal,
      sendData,
      deleteKelas,
      filterData,
    };
  },
};
</script>

<style scoped>
@import url("../assets/kelas.css");
</style>

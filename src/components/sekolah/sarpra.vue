<template>
  <div>
    <div class="kelas-container">
      <div class="kelas-wrapper">
        <button class="btn-kelas-tambah" @click="state.toggleModal = true">Tambah</button>
        <input type="text" class="filter-form" v-model="state.search" placeholder="Cari Fasilitas...">
        <table class="animate__animated animate__fadeInUp">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Fasilitas</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Foto</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, no) in filterData" :key="no">
              <td>{{ no + 1 }}</td>
              <td>{{ i.fasilitas }}</td>
              <td>{{ i.jumlah }}</td>
              <td>Rp.{{ i.harga }}</td>
              <td><img :src="i.foto_url" :alt="i.fasilitas" width="100" height="120" loading="lazy"></td>
              <td>
                <button class="btn-kelas-edit" @click="getSarpraEdit(i)">EDIT</button>
                <button class="btn-kelas-hapus" @click="deleteSarpra(i)">HAPUS</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL AREA -->
    <div class="modal" v-if="state.toggleModal === true">
      <div class="modal-body animate__animated animate__backInDown" :class="{ animate__backOutUp: state.closeModal }">
        <form @submit.prevent="sendData">
          Nama Fasilitas:<br />
          <input v-model="state.form.fasilitas" required type="text" class="form-modal"
            placeholder="Masukkan Nama Fasilitas..." />
          <br />
          Jumlah: <br />
          <input type="number" class="form-modal" v-model="state.form.jumlah" required
            placeholder="Jumlah Yang Tersedia...">
          <br />
          Harga Satuan: <br />
          <input v-model="state.form.harga" required type="number" class="form-modal" placeholder="Harga Satuan..." />
          <br />
          Foto: <br>
          <input type="file" class="form-modal" @change="handleFoto">
          <input type="submit" class="form-submit" value="Submit" />
        </form>
        <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
      </div>
    </div>


    <div class="modal" v-if="state.toggleEditModal === true">
      <div class="modal-body animate__animated animate__backInDown" :class="{ animate__backOutUp: state.closeModal }">
        <form @submit.prevent="editData">
          Nama Fasilitas:<br />
          <input v-model="state.formEdit.fasilitas" required type="text" class="form-modal"
            placeholder="Masukkan Nama Fasilitas..." />
          <br />
          Jumlah: <br />
          <input type="number" class="form-modal" v-model="state.formEdit.jumlah" required
            placeholder="Jumlah Yang Tersedia...">
          <br />
          Harga Satuan: <br />
          <input v-model="state.formEdit.harga" required type="number" class="form-modal"
            placeholder="Harga Satuan..." />
          <br />
          Foto: <br>
          <input type="file" class="form-modal" @change="handleFoto">
          <input type="submit" class="form-submit" value="Submit" />
        </form>
        <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
      </div>
    </div>

    <!-- MODAL AREA -->
  </div>
</template>

<script>
import { db, storage } from '@/firebase';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import swal from 'sweetalert';
import { reactive, onBeforeMount, computed } from 'vue';

export default {
  name: 'app',
  setup() {
    const state = reactive({
      filter: '',
      search: '',

      sarpraData: [],

      toggleModal: false,
      toggleEditModal: false,
      closeModal: false,
      getSarpraEdit: false,

      form: {
        displayTime: new Date().toLocaleDateString(),
        time: Timestamp.now().toMillis()
      },
      formEdit: {},
      file: null

    })

    const closeModal = async () => {
      state.closeModal = true
      setTimeout(() => {
        state.toggleModal = false
        state.toggleEditModal = false
        state.closeModal = false
      }, 1200);
    }

    const handleFoto = (event) => {
      state.file = event.target.files[0]
    }

    const getSarpra = () => {
      try {
        onSnapshot(query(collection(db, 'sarpra'), orderBy('time', 'asc')), (snapshot) => {
          state.sarpraData = []
          snapshot.forEach((data) => {
            const getSarpra = data.data()
            state.sarpraData.push({ ...getSarpra, id: data.id })
          })
        })
      } catch (error) {
        console.log(error)
      }
    }

    const getSarpraEdit = async (i) => {
      state.toggleEditModal = true
      try {
        const get = await getDoc(doc(db, 'sarpra', i.id))
        state.formEdit = {
          ...get.data(),
          id: get.id,
        }
      } catch (error) {
        console.log(error)
      }
    }

    const sendData = async () => {
      try {
        let foto_url = ''
        if (state.file) {
          const storageTarget = ref(storage, `fotosarpra/${state.file.name}`)
          const upload = await uploadBytes(storageTarget, state.file)
          foto_url = await getDownloadURL(upload.ref)
        }
        await addDoc(collection(db, 'sarpra'), {
          ...state.form,
          foto_url: foto_url
        })

        swal({
          icon: 'success',
          button: false,
          timer: 800
        })
        state.file = null
        closeModal()
      } catch (error) {
        console.log(error)
      }
    }

    const editData = async () => {
      try {
        let foto_url = state.formEdit.foto_url
        if (state.file) {
          const storageTarget = ref(storage, `fotosarpra/${state.file.name}`)
          const upload = await uploadBytes(storageTarget, state.file)
          foto_url = await getDownloadURL(upload.ref)
        }
        const get = await doc(db, 'sarpra', state.formEdit.id)
        await updateDoc(get, {
          ...state.formEdit,
          foto_url: foto_url
        })
        closeModal()
        swal({
          icon: 'success',
          button: false,
          timer: 600
        })
        state.file = null
      } catch (error) {
        console.log(error)
      }
    }

    const deleteSarpra = async (i) => {
      try {
        const alert = await swal({
          icon: 'warning',
          title: `Hapus Fasilitas ${i.fasilitas} ?`,
          buttons: ['TIdak', 'Iya'],
          dangerMode: true
        })

        if (alert) {
          await deleteDoc(doc(db, 'sarpra', i.id))
          swal({
            icon: 'success',
            button: false,
            timer: 500
          })
        }
      } catch (error) {
        console.log(error)
      }
    }

    onBeforeMount(() => {
      getSarpra()
    })

    const filterData = computed(() => {
      let filtered = state.sarpraData
      if (state.search) {
        filtered = filtered.filter(i => i.fasilitas.toLowerCase().toString().includes(state.search.toLowerCase()))
      }
      return filtered
    })

    return {
      state,
      closeModal,
      sendData,
      handleFoto,
      filterData,
      getSarpraEdit,
      editData,
      deleteSarpra,
    }

  }
}
</script>
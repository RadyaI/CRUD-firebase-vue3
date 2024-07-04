<template>
    <div>
        <div class="table-container">
            <div class="wrapper">
                <button class="btn-kelas-tambah" @click="state.toggleAddDataModal = true">Tambah</button>
                <table>
                    <tr>
                        <th>No</th>
                        <th>Judul</th>
                        <th>Foto</th>
                        <th>Action</th>
                    </tr>

                    <tr v-for="(i, no) in state.bukuData" :key="no">
                        <td>{{ no + 1 }}</td>
                        <td>{{ i.judul }}</td>
                        <td><img :src="i.foto" :alt="i.judul" width="100" height="120"></td>
                        <td>
                            <button class="btn-kelas-edit">Edit</button>
                            <button class="btn-kelas-hapus">Delete</button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- MODAL AREA -->

        <div class="modal" v-if="state.toggleAddDataModal">
            <div class="modal-body animate__animated animate__bounceIn"
                :class="{ 'animate__bounceOut': state.onCloseModal }">
                <form @submit.prevent="sendData">

                    Judul: <br>
                    <input type="text" class="form-modal" required v-model="state.form.judul"
                        placeholder="Masukkan Judul buku..."> <br>

                    Foto: <br>
                    <input type="file" class="form-modal" required @change="uploadFoto">
                    <input type="submit" class="form-submit">
                </form>
                <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
            </div>
        </div>

        <!-- MODAL AREA -->

    </div>
</template>

<script>
import { db, storage } from '@/firebase';
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import swal from 'sweetalert';
import 'animate.css'
import { onMounted, reactive } from 'vue';

export default {
    name: 'app',
    setup() {
        const state = reactive({
            onCloseModal: false,
            toggleAddDataModal: false,
            bukuData: [],
            form: {
                time: Timestamp.now().toMillis()
            },
            foto: null
        })

        function uploadFoto(event) {
            state.foto = event.target.files[0]
        }

        async function getBuku() {
            onSnapshot(query(collection(db, 'buku'), orderBy('time', 'asc')), (snapshot) => {
                state.bukuData = []
                snapshot.forEach((buku) => {
                    const bukuData = buku.data()
                    state.bukuData.push({ ...bukuData, id: buku.id })
                    console.log(state.bukuData)
                })
            })
        }

        async function sendData() {
            const alert = await swal({
                icon: 'warning',
                title: 'Apakah data sudah sesuai?',
                dangerMode: true,
                buttons: ['Belum', 'Sudah']
            })

            if (alert) {
                try {
                    let foto = ''
                    if (state.foto) {
                        const targetStorage = ref(storage, `buku/${state.foto.name}`)
                        const upload = await uploadBytes(targetStorage, state.foto)
                        foto = await getDownloadURL(upload.ref)
                    }

                    await addDoc(collection(db, 'buku'), {
                        ...state.form,
                        foto: foto
                    })

                    swal({
                        icon: 'success',
                        title: 'Berhasil terupload',
                        button: false,
                        timer: 1200,
                    }).then(
                        (close) => {
                            if (close) {
                                state.form = {}
                                closeModal()
                            }
                        }
                    )

                } catch (error) {
                    console.log(error)
                }
            }
        }

        function closeModal() {
            state.onCloseModal = true
            setTimeout(() => {
                state.onCloseModal = false
                state.toggleAddDataModal = false
            }, 1200);
        }

        onMounted(() => {
            getBuku()
        })

        return {
            state,
            uploadFoto,
            closeModal,
            getBuku,
            sendData,
        }

    }
}
</script>

<style scoped>
.table-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center
}

.wrapper {
    width: 80%;
}
</style>
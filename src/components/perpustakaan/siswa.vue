<template>
    <div>
        <div class="table-container">
            <div class="wrapper">
                <div class="row">
                    <button @click="state.toggleModal = true" class="btn-kelas-tambah">Tambah</button>
                    <input type="text" class="filter-form" placeholder="Cari member..." v-model="state.search">
                </div>
                <table>
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Kelas</th>
                        <th>Action</th>
                    </tr>

                    <tr v-for="(i, no) in searching" :key="no">
                        <td>{{ no + 1 }}</td>
                        <td>{{ i.nama }}</td>
                        <td>{{ i.kelas }}</td>
                        <td>
                            <button class="btn-kelas-edit" @click="getEditData(i.id)">Edit</button>
                            <button class="btn-kelas-hapus" @click="deleteData(i.id)">Delete</button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- MODAL AREA -->
        <div class="modal" v-if="state.toggleModal">
            <div class="modal-body animate__animated animate__bounceIn"
                :class="{ 'animate__bounceOut': state.onCloseModal }">
                <form @submit.prevent="sendData">

                    <label for="nama">Nama:</label> <br>
                    <input type="text" class="form-modal" required v-model="state.form.nama"><br>

                    <label for="kelas">Kelas: </label><br>
                    <select class="form-modal" required v-model="state.form.kelas">
                        <option value="-">-</option>
                        <option v-for="i in state.kelasData" :key="i.id" :value="i.ruangan">{{ i.ruangan }}</option>
                    </select>

                    <input type="submit" class="form-submit">

                </form>
                <div class="btn-tutup-modal" @click="closeModal">Tutup</div>
            </div>
        </div>

        <div class="modal" v-if="state.toggleModalEdit">
            <div class="modal-body animate__animated animate__bounceIn"
                :class="{ 'animate__bounceOut': state.onCloseModal }">
                <form @submit.prevent="saveEdit">
                    Nama: <br>
                    <input type="text" class="form-modal" v-model="state.formEdit.nama"> <br>

                    Kelas: <br>
                    <select class="form-modal" v-model="state.formEdit.kelas">
                        <option value="-">-</option>
                        <option v-for="(i, no) in state.kelasData" :key="no" :value="i.ruangan">{{ i.ruangan }}</option>
                    </select>

                    <input type="submit" class="form-submit">
                </form>
                <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
            </div>
        </div>

        <!-- MODAL AREA -->

    </div>
</template>

<script>
import { computed, onMounted, reactive } from 'vue';
import 'animate.css'

import { db } from '@/firebase'
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import swal from 'sweetalert';


export default {
    name: 'app',
    setup() {
        const state = reactive({
            toggleModal: false,
            toggleModalEdit: false,
            onCloseModal: false,
            kelasData: [],
            memberData: [],
            form: {
                time: Timestamp.now().toMillis()
            },
            formEdit: {},
            search: '',
        })

        async function getKelas() {
            const get = await getDocs(collection(db, 'kelas'))
            get.forEach((data) => {
                const dataKelas = data.data()
                state.kelasData.push({ ...dataKelas, id: data.id })
            })
        }

        async function getMemberData() {
            try {
                onSnapshot(query(collection(db, 'member_perpustakaan'), orderBy('time', 'asc')), (snapshot) => {
                    state.memberData = []
                    snapshot.forEach((member) => {
                        const data = member.data()
                        state.memberData.push({ ...data, id: member.id })
                        console.log(state.memberData)
                    })
                })
            } catch (error) {
                console.log(error)
            }
        }

        async function getEditData(i) {
            state.toggleModalEdit = true
            const data = await getDoc(doc(db, 'member_perpustakaan', i))
            state.formEdit = {
                ...data.data(),
                id: data.id
            }
        }

        async function sendData() {

            const alert = await swal({
                icon: 'warning',
                title: 'Sudah sudah benar?',
                dangerMode: true,
                buttons: ['Belum', 'Sudah']
            })

            if (alert) {
                try {
                    addDoc(collection(db, 'member_perpustakaan'), state.form)
                    swal({
                        icon: 'success',
                        title: 'Berhasil tambah siswa',
                        button: 'Tutup'
                    }).then(
                        (tutup) => {
                            if (tutup) {
                                state.form = {}
                                state.onCloseModal = true
                                setTimeout(() => {
                                    state.onCloseModal = false
                                    state.toggleModal = false
                                }, 1200);
                            }
                        }
                    )
                } catch (r) {
                    console.log(r)
                }
            }
        }

        async function saveEdit() {
            const alert = await swal({
                icon: 'warning',
                title: 'Sudah yakin?',
                dangerMode: true,
                buttons: ['Belum', 'Sudah']
            })

            if (alert) {
                try {
                    await updateDoc(doc(db, 'member_perpustakaan', state.formEdit.id), state.formEdit)
                    swal({
                        icon: 'success',
                        title: 'Berhasil ubah data',
                        button: 'Tutup'
                    }).then(
                        (tutup) => {
                            if (tutup) {
                                closeModal()
                            }
                        }
                    )
                } catch (error) {
                    console.log(error)
                }
            }
        }

        async function deleteData(i) {
            const alert = await swal({
                icon: 'warning',
                title: 'Ingin hapus data?',
                dangerMode: true,
                buttons: ['Tidak', 'Hapus']
            })

            if (alert) {
                const data = await doc(db, 'member_perpustakaan', i)
                deleteDoc(data)
                swal({
                    icon: 'success',
                    title: false,
                    button: false,
                    timer: 1200
                })
            }
        }

        function closeModal() {
            state.onCloseModal = true
            setTimeout(() => {
                state.onCloseModal = false
                state.toggleModal = false
                state.toggleModalEdit = false
            }, 1200);
        }

        const searching = computed(() => {
            let filtered = state.memberData
            if(!state.search == ''){
                filtered = filtered.filter(i => i.nama.toLowerCase().toString().includes(state.search.toLowerCase()))
            }
            return filtered
        })

        onMounted(() => {
            getKelas()
            getMemberData()
        })

        return {
            state,
            searching,
            closeModal,
            getKelas,
            getEditData,
            sendData,
            saveEdit,
            deleteData,
        }
    }
}
</script>

<style scoped>
.table-container {
    /* border: 1px solid blue; */
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.table-container .wrapper {
    /* border: 1px solid red; */
    width: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
}

table {
    width: 100%;
}
</style>
<template>
    <div>
        <div class="table-container">
            <div class="wrapper">
                <button @click="state.toggleModal = true">Tambah</button>
                <table>
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Kelas</th>
                        <th>Action</th>
                    </tr>

                    <tr v-for="(i, no) in state.memberData" :key="no">
                        <td>{{ no + 1 }}</td>
                        <td>{{ i.nama }}</td>
                        <td>{{ i.kelas }}</td>
                        <td>
                            <button class="btn-kelas-edit">Edit</button>
                            <button class="btn-kelas-hapus">Delete</button>
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
        <!-- MODAL AREA -->

    </div>
</template>

<script>
import { onMounted, reactive } from 'vue';
import 'animate.css'

import { db } from '@/firebase'
import { Timestamp, addDoc, collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import swal from 'sweetalert';


export default {
    name: 'app',
    setup() {
        const state = reactive({
            toggleModal: false,
            onCloseModal: false,
            kelasData: [],
            memberData: [],
            form: {
                time: Timestamp.now().toMillis()
            },
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
                    })
                })
            } catch (error) {
                console.log(error)
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

        function closeModal() {
            state.onCloseModal = true
            setTimeout(() => {
                state.onCloseModal = false
                state.toggleModal = false
            }, 1200);
        }

        onMounted(() => {
            getKelas(),
                getMemberData()
        })

        return {
            state,
            closeModal,
            getKelas,
            sendData
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
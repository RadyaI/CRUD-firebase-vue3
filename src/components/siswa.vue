<template>
    <div>
        <div class="kelas-container">
            <div class="kelas-wrapper">
                <button class="btn-kelas-tambah" @click="state.toggleModal = true">Tambah</button>
                <select placeholder="Filter Kelas" class="filter-form" v-model="state.filter">
                    <option value="">Semua Kelas</option>
                    <option value="X ">Kelas 10</option>
                    <option value="XI ">Kelas 11</option>
                    <option value="XII ">Kelas 12</option>
                </select>
                <input type="text" class="filter-form" placeholder="Cari Siswa..." v-model="state.search">
                <table class="animate__animated animate__fadeInUp">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Kelas</th>
                            <th>Gender</th>
                            <th>Foto</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(i, no) in filterData" :key="no">
                            <td>{{ no + 1 }}</td>
                            <td>{{ i.nama_siswa }}</td>
                            <td>{{ i.kelas }}</td>
                            <td><img :src="i.foto_url" alt="" width="100" height="120" loading="lazy"></td>
                            <td>{{ i.gender }}</td>
                            <td>
                                <button class="btn-kelas-edit" @click="editSiswaModal(i)">EDIT</button>
                                <button class="btn-kelas-hapus" @click="deleteSiswa(i)">HAPUS</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL AREA -->
        <div class="modal" v-if="state.toggleModal === true">
            <div class="modal-body animate__animated animate__backInDown"
                :class="{ animate__backOutUp: state.closeModal }">
                <form @submit.prevent="sendData">
                    Nama:<br />
                    <input v-model="state.form.nama_siswa" required type="text" class="form-modal"
                        placeholder="Masukkan Nama Siswa..." />
                    <br />
                    Kelas: <br />
                    <select v-model="state.form.kelas" required class="form-modal">
                        <option :value="i.kelasData" v-for="(i, no) in state.kelasData" :key="no">{{ i.kelasData }}
                        </option>
                    </select>
                    <br />
                    Gender: <br />
                    <select v-model="state.form.gender" class="form-modal">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                    <br />
                    Foto <br>
                    <input required type="file" @change="handleFileUpload" class="form-modal"><br>
                    <input type="submit" class="form-submit" value="Submit" />
                </form>
                <button class="btn-tutup-modal" @click="closeModal">Tutup</button>
            </div>
        </div>



        <div class="modal" v-if="state.toggleEditModal === true">
            <div class="modal-body animate__animated animate__backInDown"
                :class="{ animate__backOutUp: state.closeModal }">
                <form @submit.prevent="editSiswa">
                    Nama Siswa:<br />
                    <input v-model="state.formEdit.nama_siswa" required type="text" class="form-modal"
                        placeholder="Masukkan Kelas/Tingkat..." />
                    <br />
                    Jurusan: <br />
                    <select v-model="state.formEdit.kelas" required class="form-modal">
                        <option :value="i.kelasData" v-for="(i, no) in state.kelasData" :key="no">{{ i.kelasData }}
                        </option>
                    </select>
                    <br />
                    Gender: <br />
                    <select class="form-modal" v-model="state.formEdit.gender">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select><br>
                    Foto <br>
                    <input type="file" @change="handleFileUpload" class="form-modal"><br>
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
import 'animate.css'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc, } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage'
import swal from 'sweetalert';
import { reactive, onMounted, computed } from 'vue';

export default {
    name: 'app',
    setup() {
        const state = reactive({
            filter: "",
            search: "",
            toggleModal: false,
            toggleEditModal: false,
            closeModal: false,
            siswaData: [],
            kelasData: [],
            form: {
                created_at: new Date().toLocaleTimeString(),
                time: Timestamp.now().toMillis()
            },
            formEdit: {},
            file: null
        })

        const handleFileUpload = (event) => {
            state.file = event.target.files[0]
        }

        const getKelas = async () => {
            const get = await getDocs(query(collection(db, 'kelas'), orderBy('tingkat', 'asc')))
            get.forEach((data) => {
                const kelasData = data.data().ruangan
                state.kelasData.push({ kelasData })
            })
        }

        const getSiswa = () => {
            try {
                onSnapshot(query(collection(db, 'siswa'), orderBy('kelas', 'asc')), (snapshot) => {
                    state.siswaData = []
                    snapshot.forEach((data) => {
                        const siswa = data.data()
                        state.siswaData.push({ ...siswa, id: data.id })
                    })
                })
            } catch (error) {
                console.log(error)
            }
        }

        const editSiswaModal = async (i) => {
            try {
                state.toggleEditModal = true
                const get = await getDoc(doc(db, 'siswa', i.id))
                const dataUserEdit = {
                    id: get.id,
                    nama_siswa: get.data().nama_siswa,
                    kelas: get.data().kelas,
                    gender: get.data().gender,
                    foto_url: get.data().foto_url
                }
                state.formEdit = dataUserEdit
            } catch (error) {
                console.log(error)
            }
        }

        const sendData = async () => {
            try {
                let foto_url = ''
                if (state.file) {
                    const storageRef = ref(storage, `fotosiswa/${state.file.name}`)
                    const upload = await uploadBytes(storageRef, state.file)
                    foto_url = await getDownloadURL(upload.ref)
                }
                await addDoc(collection(db, 'siswa'), {
                    ...state.form,
                    foto_url: foto_url
                })
                swal({
                    icon: 'success',
                    button: false,
                    timer: 900
                })
                state.form = {}
                state.file = null
                closeModal()
            } catch (error) {
                console.log(error)
            }
        }

        const deleteSiswa = async (i) => {
            try {
                const alert = await swal({
                    icon: 'warning',
                    title: `Hapus siswa ${i.nama_siswa}`,
                    buttons: ['Tidak', 'Hapus']
                })

                if (alert) {
                    await deleteDoc(doc(db, 'siswa', i.id))
                    swal({
                        icon: 'success',
                        button: false,
                        timer: 800
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }

        const editSiswa = async () => {
            try {
                let foto_url = state.formEdit.foto_url
                if (state.file) {
                    const storageTarget = ref(storage, `fotosiswa/${state.file.name}`)
                    const upload = await uploadBytes(storageTarget, state.file)
                    foto_url = await getDownloadURL(upload.ref)
                }
                const get = await doc(db, 'siswa', state.formEdit.id)
                await updateDoc(get, {
                        ...state.formEdit,
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

        const closeModal = () => {
            state.closeModal = true
            setTimeout(() => {
                state.toggleEditModal = false
                state.toggleModal = false
                state.closeModal = false
            }, 1200);
        }

        const filterData = computed(() => {
            let filtered = state.siswaData
            if (state.search) {
                filtered = filtered.filter((i) => i.nama_siswa.toString().toLowerCase().includes(state.search.toLowerCase()))
            }
            if (state.filter) {
                filtered = filtered.filter(i => i.kelas.includes(state.filter))
            }
            return filtered
        })

        onMounted(() => {
            getKelas()
            getSiswa()
        })

        return {
            state,
            closeModal,
            sendData,
            filterData,
            deleteSiswa,
            editSiswa,
            editSiswaModal,
            handleFileUpload,
        }
    }
}
</script>
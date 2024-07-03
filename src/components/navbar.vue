<template>
    <div>
        <div class="navbar">
            <div class="group-list">
                <div class="list" @click="redirect('/')"
                    :class="{ 'nav-select': state.selected == '/' }">Sekolah</div>
                <div class="list" @click="redirect('perpustakaan')"
                    :class="{ 'nav-select': state.selected == 'perpustakaan' }">Perpustakaan</div>
                <div class="list" @click="redirect('prestasi')" :class="{ 'nav-select': state.selected == 'prestasi' }">
                    Prestasi</div>
            </div>
        </div>
    </div>
</template>

<script>
import router from '@/router';
import { onMounted, reactive } from 'vue';

export default {
    name: 'app',
    setup(props, { emit }) {
        const state = reactive({
            selected: '/'
        })

        function redirect(i) {
            router.push(`${i}`)
            state.selected = i
        }

        onMounted(() => {
            emit('nav-select', state.selected)
        })
        return {
            state,
            redirect
        }
    }
}
</script>

<style setup>
.navbar {
    /* border: 1px solid black; */
    width: 100%;
    height: 30px;
    padding: 20px 0;
    display: flex;
    justify-content: end;
    align-items: center;
}

.navbar .group-list {
    /* border: 1px solid black; */
    width: 400px;
    height: auto;
    margin-right: 50px;
    display: flex;
    justify-content: space-evenly;
    align-items: center
}

.navbar .group-list .list {
    font-size: large;
    font-weight: bolder;
    cursor: pointer;
    transition: transform 0.3s, border 2s;
    padding: 5px;
}

.navbar .group-list .list:hover {
    border: 1px solid black;
    transform: scale(1.1);
}

/* .nav-select {
    border: 1px solid black;
    border-radius: 10px;
} */
</style>
<template>
    <div class="bg-container">
        <img src="/maya_left.png" id="left-img" />
        <img src="/maya_right.png" id="right-img" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MayaBackground'
})
</script>

<style>
    .bg-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        opacity: 0.1;
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: -9999;
    }

    #right-img {
        transform: scale(-1, 1);
    }

    #left-img {
        transform: scale(-1, 1);
    }
</style>
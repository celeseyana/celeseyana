<template>
    <nav class="navbar" role="navigation" aria-label="main navigation" >
        <div class="navbar-brand">
            <div class="logo-text">
                <img src="/KAMIL.png" />
                <span>where the FUCK is kamil?</span>
            </div>
            <a class="github-container" target="_blank" href="https://github.com/celeseyana/where-are-you-kamil">
                <i class="fa-brands fa-github"></i>
            </a>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Navbar',
})
</script>

<style>
    nav {
        position: relative;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        background-color: rgba(0, 0, 0, 0.15);
    }

    .navbar-brand {
        display: flex;
        flex-direction: row;
        width: 100%;
        margin: 10px 16px 10px 25px;
        justify-content: space-between;
        align-items: center;
    }

    .github-container {
        display: flex;
        margin: 10px 35px 10px 0px;
        align-items: center;
        justify-content: center;
    }

    .fa-github {
        color: white;        
    }

    .github-container,
    .fa-github {
        width: 32px;
        height: 32px;
    }

    .logo-text {
        display: flex;
        align-items: center;
    }

    .logo-text img {
        width: 64px;
        height: 64px;
        border-radius: 10%;
    }

    .logo-text span {
        font-family: Tahoma, Verdana, Segoe, sans-serif;
        color: white;
        margin-left: 10px;
        font-size: 16px;
    }
</style>
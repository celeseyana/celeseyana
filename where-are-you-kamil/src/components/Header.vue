<template>
	<div class="main-header">
        <span id="main-span">where is kamil?</span>

        <div id="main-icon">
            <img id="kamil-icon" src="/main_icon.webp" />
            <span id="icon-desc">a tool to find out where is kamil</span>
        </div>

        <a href="https://github.com/celeseyana/where-are-you-kamil" class="github" target="_blank">
            <font-awesome-icon :icon="['fab', 'github']" class="github-inner"/>
        </a>	
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Header'
})
</script>

<style>
	.main-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		position: relative;
		width: 100%;
        max-height: 2vw;
	}

    #main-span {
        color: white;
        margin-left: 1%;
    }

    #kamil-icon {
        width: 1.5vw;
        height: 1.5vw;
        margin: 5%;
    }

    #main-icon {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .github {
        margin-right: 1%;
    }

    .github-inner {
        width: 1.5vw;
        height: 1.5vw;
        color: white;
    }
</style>
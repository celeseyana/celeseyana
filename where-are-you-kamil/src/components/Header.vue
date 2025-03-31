<template>
	<div class="main-header">
        <div id="main-icon">
            <img id="kamil-icon" src="/main_icon.webp" />
            <span id="icon-desc">finding kamil</span>
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
		flex-direction: column;
		align-items: center;
        justify-content: center;
		position: absolute;
        width: 128px;
		height: 100%;
	}

    #main-span {
        color: white;
        margin-left: 1%;
    }

    #kamil-icon {
        width: 80px;
        height: 80px;
        margin: 5%;
    }

    #main-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    }

    #icon-desc {
        align-items: center;
        justify-content: center;
        font-family: 'Montserrat', sans-serif;
        font-size: large;
        margin: 20px 0px 20px 0px;
    }

    .github-inner {
        width: 50px;
        height: 50px;
        color: white;
    }

    @media (max-width: 1100px) {
        .main-header {
            width: 100%;
            height: fit-content;
            display: flex;
            flex-direction: row;
            position: absolute;
        }

        #kamil-icon {
            width: 40px;
            height: 40px;
            margin: 3.75%;
        }

        #main-icon {
            flex-direction: row;
        }
        
        #icon-desc {
            font-size: 0.75em;
            margin: 15px 0;
        }
        
        .github-inner {
            width: 24px;
            height: 24px;
        }
    }

</style>
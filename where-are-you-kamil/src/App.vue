<template>
	<Navbar />
	<TopRankings />
	<div class="site-background">
		<img src="/trim_normal.png" />
	</div>
</template>

<script setup lang="ts">
import "bulma/css/bulma.css";
import Navbar from './components/Navbar.vue';
import TopRankings from './components/TopRankings.vue';
</script>

<style>
	html {
		background-color: #14161a;
		width: 100%;
		height: 100%;
	}

	body {
		margin: 0;
	}

	.site-background {
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		opacity: 0.25;
		z-index: -999;
		bottom: 0;
	}

	.site-background img {
		position: absolute;
	}

	@media (max-height: 850px) {
		.site-background {
			width: 512px;
			height: 512px;
		}

		.site-background img {
			width: 512px;
			height: 512px;
		}
	}
</style>
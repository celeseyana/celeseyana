<template>
	<div class="body-container">
			<Header />
			<MayaBackground />
		<div class="content-area">
			<TopRankings />
		</div>
	</div>
</template>

<script setup lang="ts">
	import MayaBackground from './components/MayaBackground.vue';
	import Header from './components/Header.vue';
	// import EventPoints from './components/EventPoints.vue';
	import TopRankings from './components/TopRankings.vue';
</script>

<style>
	html, body {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.body-container {
		display: flex;
		width: 100%;
		height: 100%;
		position: absolute;
	}

	.content-area {
		flex: 1;
		overflow: auto;
		position: relative;
		margin-left: 128px;
	}
</style>
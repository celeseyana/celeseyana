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
	}

	.body-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		position: absolute;
	}

	.content-area {
		flex: 1;
		height: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		margin-left: 0;
		padding: 20px;
		box-sizing: border-box;
	}
</style>
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
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.body-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.content-area {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		box-sizing: border-box;
		overflow-y: hidden;
	}

	@media (max-width: 900px) {
		html, body {
			overflow: auto;
		}

		.content-area {
			overflow-y: auto;
			margin-top: 60px;
			padding-top: 10px;
		}

		.t10-leaderboard-container {
			padding-bottom: 20px;
		}
	}
</style>
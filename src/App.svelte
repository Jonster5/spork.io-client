<script lang="ts">
	import { onMount } from 'svelte';
	import { ECS, Vec2 } from 'raxis';
	import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
	import { PlayerPlugin } from './game/player';
	import { RemotePlugin } from './game/remote';
	import { createGame } from './game/game';

	let target: HTMLElement;
	let ecs: ECS;

	onMount(() => {
		ecs = createGame(target);
		ecs.run();
	});
</script>

<main>
	<div bind:this={target} />
</main>

<style lang="scss">
	main {
		display: flex;
		width: 100%;
		height: 100%;

		justify-content: center;
		align-items: center;

		div {
			width: 60%;
			height: 60%;
			background: linen;
			border: 3px solid black;
		}
	}
</style>

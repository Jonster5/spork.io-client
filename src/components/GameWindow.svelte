<script lang="ts">
	import type { ECS } from 'raxis';
	import { onMount } from 'svelte';
	import { createGame } from '../game/game';

	let target: HTMLElement;
	let ecs: ECS;

	const username = localStorage.getItem('name') ?? '';
	const url = localStorage.getItem('server') ?? '';

	onMount(() => {
		ecs = createGame(target, username, url);
		ecs.run();
	});
</script>

<div id="target" bind:this={target} />

<style lang="scss">
	@import '../colors.scss';

	#target {
		background-color: $DarkBg;
	}
</style>

<script lang="ts">
	import type { ECS } from 'raxis';
	import { onMount } from 'svelte';
	import { createGame } from '../game/game';
	import { UIData } from '../game/ui';
	import { writable, type Writable } from 'svelte/store';
	import Tools from './Tools.svelte';
	import Inventory from './Inventory.svelte';
	import type { ToolList } from '../game/tools';

	let target: HTMLElement;
	let ecs: ECS;

	const username = localStorage.getItem('name') ?? '';
	const url = localStorage.getItem('server') ?? '';

	const tools: Writable<ToolList> = writable([0, 0, 0, 0]);
	const selectedTool: Writable<0 | 1 | 2 | 3> = writable(0);

	const wood = writable(0);
	const stone = writable(0);
	const food = writable(0);
	const gold = writable(0);

	const ui = new UIData(tools, selectedTool, wood, stone, food, gold);

	onMount(() => {
		ecs = createGame(target, ui, username, url);
		ecs.run();
	});
</script>

<div id="target" bind:this={target} />

<main>
	<div class="inventory">
		<Inventory {wood} {stone} {food} {gold} />
	</div>
	<div class="tools">
		<Tools {tools} {selectedTool} />
	</div>
</main>

<style lang="scss">
	@import '../colors.scss';

	main {
		display: grid;

		width: 100%;
		height: 100%;

		padding: 10px;
		box-sizing: border-box;

		grid: repeat(10, 1fr) / repeat(9, 1fr);
		gap: 10px;

		.inventory {
			grid-area: 1 / 1 / span 1 / span 2;
		}

		.tools {
			grid-area: -2 / 1 / span 1 / span 2;
		}
	}

	#target {
		position: absolute;

		width: 100%;
		height: 100%;

		z-index: -10;

		background-color: $DarkBg;
	}
</style>

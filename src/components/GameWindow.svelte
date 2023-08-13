<script lang="ts">
	import type { ECS, EventWriter } from 'raxis';
	import { onMount } from 'svelte';
	import { createGame } from '../game/game';
	import { RequestUpgradeEvent, UIData } from '../game/ui';
	import { writable, type Writable } from 'svelte/store';
	import Inventory from './Inventory.svelte';
	import type { ToolList, ToolType } from '../game/tools';
	import ToolItem from './ToolItem.svelte';

	let target: HTMLElement;
	let ecs: ECS;

	const username = localStorage.getItem('name') ?? '';
	const url = localStorage.getItem('server') ?? '';

	const tools: Writable<ToolList> = writable([0, 0, 0, 0]);
	const selectedTool: Writable<ToolType> = writable('wood');

	let requestUpgradeEvent: EventWriter<RequestUpgradeEvent>;

	const wood = writable(0);
	const stone = writable(0);
	const food = writable(0);
	const gold = writable(0);

	const ui = new UIData(tools, selectedTool, wood, stone, food, gold);

	onMount(async () => {
		ecs = createGame(target, ui, username, url);
		console.log(ecs);
		// await ecs.run();
		console.log(ecs);
		requestUpgradeEvent = ecs.getEventWriter(RequestUpgradeEvent);
	});
</script>

<div id="target" bind:this={target} />

<main>
	<div class="inventory">
		<Inventory {wood} {stone} {food} {gold} />
	</div>
	<div class="tools">
		<ToolItem type="wood" {selectedTool} {requestUpgradeEvent} {tools} />
		<ToolItem type="stone" {selectedTool} {requestUpgradeEvent} {tools} />
		<ToolItem type="melee" {selectedTool} {requestUpgradeEvent} {tools} />
		<ToolItem type="projectile" {selectedTool} {requestUpgradeEvent} {tools} />
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
			display: flex;

			width: 100%;
			height: 100%;

			grid-area: -2 / 1 / span 1 / span 2;

			justify-content: center;
			gap: 20px;
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

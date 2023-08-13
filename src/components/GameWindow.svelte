<script lang="ts">
	import type { ECS, EventWriter } from 'raxis';
	import { onMount } from 'svelte';
	import { createGame } from '../game/game';
	import { UIData } from '../game/ui';
	import { writable, type Writable } from 'svelte/store';
	import Inventory from './Inventory.svelte';
	import { RequestUpgradeEvent, type ToolList, type ToolType } from '../game/tools';
	import ToolItem from './ToolItem.svelte';
	import HotbarItem from './HotbarItem.svelte';

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
		await ecs.run();
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
	<div class="hotbar">
		<HotbarItem background="royalblue" />
		<HotbarItem />
		<HotbarItem />
		<HotbarItem />
		<HotbarItem />
		<HotbarItem />
		<HotbarItem />
	</div>
</main>

<style lang="scss">
	@import '../colors.scss';

	main {
		width: 100%;
		height: 100%;

		padding: 10px;
		box-sizing: border-box;

		gap: 10px;

		.hotbar {
			display: flex;
			position: absolute;

			height: 10vh;

			padding: 0 10px;

			bottom: 10px;
			left: 50%;
			transform: translateX(-50%);

			background: #00000088;
			border-radius: 10px;
			box-shadow: 0 0 10px black;
		}

		.inventory {
			position: absolute;

			height: 5vh;

			top: 10px;
			left: 10px;
		}

		.tools {
			display: flex;
			position: absolute;

			height: 10vh;

			left: 10px;
			bottom: 10px;

			justify-content: space-evenly;

			background: #00000088;
			border-radius: 10px;
			box-shadow: 0 0 10px black;
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

<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { ToolList } from '../game/tools';
	import { RequestUpgradeEvent } from '../game/ui';
	import type { EventWriter } from 'raxis';

	export let tools: Writable<ToolList>;
	export let selectedTool: Writable<number>;
	export let requestUpgradeEvent: EventWriter<RequestUpgradeEvent>;

	const toolSrc = [
		['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', ''],
		['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', ''],
		['', '', ''],
		['', '', ''],
	];
</script>

<div class="toolbox">
	{#each $tools as tool, type}
		<button class="holder" on:click={() => ($selectedTool = type)}>
			<div class={$selectedTool === type ? 'selected' : ''}>
				<img class="tool" src={toolSrc[type][tool]} alt={type.toString()} />
			</div>
			<button class="upgrade" on:click={() => {$selectedTool = type; requestUpgradeEvent.send(new RequestUpgradeEvent(type))}}>
				<img src="./upgrade.svg" alt="upgrade">
			</button>
		</button>
		
	{/each}
</div>

<style lang="scss">
	@import '../colors.scss';

	.holder {
		position: relative;
		display: flex;
		height: 100%;
		aspect-ratio: 1;

		justify-content: center;
		align-items: center;

		outline: none;
		background-color: gray;
		border-radius: 10px;
		border: none;

		.selected {
			background-color: lime !important;
		}

		div {
			display: flex;
			width: 80%;
			height: 80%;

			background-color: white;
			border-radius: 10px;

			img {
				user-select: none;
				width: 100%;
				height: 100%;

				image-rendering: pixelated;
			}
		}
	}

	.upgrade {
		position: absolute;
		top: 0;
		right: 0;
		img {
			width: 30px;
			height: 30px;
		}
	}

	.toolbox {
		position: relative;
		display: flex;

		width: 100%;
		height: 100%;

		justify-content: center;
		gap: 20px;
	}
</style>

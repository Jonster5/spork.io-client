<script lang="ts">
	import type { EventWriter } from 'raxis';
	import type { Writable } from 'svelte/store';
	import { RequestUpgradeEvent, type ToolList, type ToolType } from '../game/tools';
	import { toolAssets } from '../game/assets';

	export let tools: Writable<ToolList>;
	export let type: ToolType;
	export let selectedTool: Writable<ToolType>;
	export let requestUpgradeEvent: EventWriter<RequestUpgradeEvent>;

	const index = type === 'wood' ? 0 : type === 'stone' ? 1 : type === 'melee' ? 2 : 3;

	$: isSelected = $selectedTool === type;
</script>

<button class="holder" style:transform={isSelected ? 'translateY(-10px)' : ''} on:click={() => ($selectedTool = type)}>
	<div class={isSelected ? 'selected' : ''}>
		<img class="tool" src={toolAssets[type][$tools[index]]} alt={type} />
	</div>
	<button
		class="upgrade"
		on:click={() => {
			$selectedTool = type;
			requestUpgradeEvent.send(new RequestUpgradeEvent(type));
		}}
	>
		<img src="./upgrade.svg" alt="upgrade" />
	</button>
</button>

<style lang="scss">
	@import '/src/colors.scss';

	.holder {
		height: 100%;
		aspect-ratio: 1;

		display: flex;
		position: relative;

		justify-content: center;
		align-items: center;

		background: none;

		border-radius: 10px;
		border: none;

		transition-duration: 50ms;
		outline: none;

		user-select: none;
		&:hover {
			cursor: pointer;
		}

		.selected {
			background-color: lime !important;
		}

		div {
			display: flex;
			width: 80%;
			height: 80%;

			background-color: white;
			border-radius: 10px;
			user-select: none;

			img {
				width: 100%;
				height: 100%;
				border-radius: 10px;
				background: none;
				user-select: none;

				image-rendering: pixelated;
			}
		}
	}

	.upgrade {
		position: absolute;

		width: 30px;
		height: 30px;

		top: 0;
		right: 0;

		background: none;
		border: none;
		outline: none;

		img {
			width: 30px;
			height: 30px;
		}
	}
</style>

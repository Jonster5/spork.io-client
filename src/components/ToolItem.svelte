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
</script>

<article>
	<button class="holder" on:click={() => ($selectedTool = type)}>
		<div class={$selectedTool === type ? 'selected' : ''}>
			<img class="tool" src={toolAssets[type][$tools[index]]} alt={type} />
		</div>
		<button
			class="upgrade"
			on:click={() => {
				$selectedTool = type;
				requestUpgradeEvent.send(new RequestUpgradeEvent(type));
			}}
			>``
			<img src="./upgrade.svg" alt="upgrade" />
		</button>
	</button>
</article>

<style lang="scss">
	@import '../colors.scss';
	article {
		height: 100%;
		aspect-ratio: 1;

		position: relative;
		display: flex;

		justify-content: center;
		align-items: center;

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
</style>

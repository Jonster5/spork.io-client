<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { ToolList } from '../game/tools';

	export let tools: Writable<ToolList>;
	export let selectedTool: Writable<number>;

	const toolSrc = ['./iron_axe.png', '', '', ''];
</script>

<div class="toolbox">
	{#each $tools as tool, type}
		<button class="holder" on:click={() => ($selectedTool = type)}>
			<div class={$selectedTool === type ? 'selected' : ''}>
				<img class="tool" src={toolSrc[type]} alt={type.toString()} />
			</div>
		</button>
	{/each}
</div>

<style lang="scss">
	@import '../colors.scss';

	.holder {
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
				width: 100%;
				height: 100%;

				image-rendering: pixelated;
			}
		}
	}

	.toolbox {
		display: flex;

		width: 100%;
		height: 100%;

		justify-content: center;
		gap: 20px;
	}
</style>

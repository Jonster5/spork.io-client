<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let wood: Writable<number>;
	export let stone: Writable<number>;
	export let food: Writable<number>;
	export let gold: Writable<number>;
</script>

<div class="box">
	<div class="resource">
		<img src="wood.svg" alt="Wood" /><span>x{$wood}</span>
	</div>
	<div class="line" />
	<div class="resource">
		<img src="stone.svg" alt="Stone" /> <span>{$stone}</span>
	</div>
	<div class="line" />
	<div class="resource">
		<img src="food.svg" alt="Food" /> <span>{$food}</span>
	</div>
	<div class="line" />
	<div class="resource">
		<img src="gold.svg" alt="Gold" /> <span>{$gold}</span>
	</div>
</div>

<style lang="scss">
	.box {
		display: flex;
		height: 100%;

		padding: 10px;
		box-sizing: border-box;

		justify-content: space-between;
		align-items: center;

		background: #00000088;
		border-radius: 10px;

		.line {
			height: 80%;
			width: 1px;

			background-color: white;
		}

		.resource {
			display: flex;

			height: 100%;
			width: 4vw;

			justify-content: space-evenly;
			align-items: center;

			img {
				height: 75%;
				aspect-ratio: 1;
			}

			span {
				margin: 10px;
				box-sizing: border-box;

				color: white;
				font-family: 'Cousine';
				font-size: 2vh;
			}
		}
	}
</style>

<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let wood: Writable<number>;
	export let stone: Writable<number>;
	export let food: Writable<number>;
	export let gold: Writable<number>;
</script>

<div class="box">
	<div class="res">
		<img src="wood.svg" alt="Wood" /> <span>{$wood}</span>
	</div>
	<div class="res">
		<img src="stone.svg" alt="Stone" /> <span>{$stone}</span>
	</div>
	<div class="res">
		<img src="food.svg" alt="Food" /> <span>{$food}</span>
	</div>
	<div class="res">
		<img src="gold.svg" alt="Gold" /> <span>{$gold}</span>
	</div>
</div>

<style lang="scss">
	.box {
		display: flex;
		width: 80%;
		height: 50%;

		padding: 10px;
		box-sizing: border-box;

		justify-content: space-between;
		align-items: center;

		background: #00000088;
		border-radius: 10px;

		.res {
			display: flex;

			height: 100%;
			width: 20%;

			justify-content: space-between;
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

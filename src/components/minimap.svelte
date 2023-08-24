<script lang="ts">
	import type { Vec2 } from 'raxis';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let mapdata: Writable<ImageData>;
	export let playerpos: Writable<Vec2>;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let zoom = 2;

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	$: {
		if (ctx && canvas) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.putImageData(
				$mapdata,
				-$playerpos.x - $mapdata.width / zoom / 2,
				$playerpos.y - $mapdata.height / zoom / 2
			);

			ctx.fillStyle = 'black';
			ctx.fillRect(canvas.width / 2 - 1, canvas.height / 2 - 1, 2, 2);
		}
	}
</script>

<canvas bind:this={canvas} width={$mapdata.width / zoom} height={$mapdata.height / zoom} />

<style lang="scss">
	canvas {
		width: 100%;
		height: 100%;
		background: blue;

		border: 10px solid black;
		border-radius: 50%;
		box-sizing: border-box;

		image-rendering: pixelated;
	}
</style>

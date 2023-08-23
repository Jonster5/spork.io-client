<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { blockAssets } from '../game/assets';
	import type { BlockType } from '../game/loadchunks';

	export let name: keyof typeof blockAssets;
	export let selectedBlock: Writable<'none' | BlockType>;

	let tier = 0;
	let menu = false;
	const tiers = blockAssets[name].map<string>((e) => e[0]);
	const urls = blockAssets[name].map<string>((e) => e[1]);

	$: selected = $selectedBlock.split('-')[0] === name;

	$: if (!selected) menu = false;

	const setName = () => {
		$selectedBlock = !selected || menu ? (`${name}-${tiers[tier]}` as 'none' | BlockType) : 'none';
	};

	const click = () => {
		setName();
		if (menu) menu = false;
	};
	const dblclick = () => {
		setName();
		menu = !menu;
	};

	const setTier = (val: number) => {
		tier = val;
		setName();
		menu = false;
	};
</script>

<div class="outer">
	<div class="inner" class:selected class:menu>
		<div class="selector" class:menu>
			{#if menu}
				{#each urls as url, i}
					<button
						on:click={() => setTier(i)}
						class:menu
						class="other"
						style:background-image={`url(${url})`}
					/>
				{/each}
			{/if}
		</div>
		<button
			on:click={click}
			on:dblclick={dblclick}
			class:menu
			class="main"
			style:background-image={`url(${blockAssets[name][tier][1]})`}
		/>
	</div>
</div>

<style lang="scss">
	@import '../colors.scss';

	.selected {
		transform: translateY(-20px);
	}

	div.outer {
		width: 4vw;
		margin: auto 10px;
	}

	div.selector {
		display: flex;
		flex-direction: column-reverse;
		width: 4vw;
		height: 0;
		gap: 10px;

		&.menu {
			height: unset;
		}
	}

	div.inner {
		display: flex;

		flex-direction: column;
		transition-duration: 80ms;

		&.menu {
			position: absolute;

			bottom: 20px;

			background-color: #00000088;
			border-radius: 10px;
		}
	}

	button {
		border-radius: 10px;
		border: none;

		width: 4vw;
		height: 4vw;

		background-size: 100% 100%;
		background-color: transparent;
		outline: none;

		&.menu {
			&.other {
				width: 3.8vw;
				height: 3.8vw;
				margin: 0.1vw 0.1vw;

				&:hover {
					margin: 0;
					width: 4vw;
					height: 4vw;
					border: 0.1vw solid royalblue;
				}
			}

			&.main {
				margin: 10px 0 0;
				width: 4vw;
				height: 4vw;
				border: 0.1vw solid lime;
			}
		}

		&:hover {
			cursor: pointer;
		}
	}
</style>

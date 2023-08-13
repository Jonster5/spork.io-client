<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let name: string;
	export let online: boolean;
	export let playerCount: number;
	export let index: number;
	export let selected: Writable<number>;

	const dotColor = online ? 'lime' : 'red';
	$: isSelected = $selected === index ? '#a1acbf' : '#4b5059';
</script>

<button
	style={isSelected ? 'background: #a1acbf !important' : ''}
	style:background={isSelected}
	on:click={() => ($selected = index)}
>
	<span class="dot" style:color={dotColor}>•••</span>
	<span class="name">{name}</span>
	<span class="count">{playerCount}</span>
</button>

<style lang="scss">
	@import '../colors.scss';

	.dot {
		letter-spacing: 0;
		align-content: center;
		line-height: -50px;
	}

	button {
		display: flex;
		width: 100%;
		height: 3vh;

		padding: 10px;
		box-sizing: border-box;

		justify-content: space-between;
		align-items: center;
		border: none;
		outline: none;

		font-family: 'Cousine', sans-serif;

		span {
			color: black;
			user-select: none;
			font-family: 0.5vw;
		}

		&:hover {
			cursor: pointer;
			background: #8790a1;
		}
	}
</style>

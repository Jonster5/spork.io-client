<script lang="ts">
	import type { Writable } from 'svelte/store';
	import ServerList from '../components/ServerList.svelte';

	export let page: Writable<'title' | 'game'>;

	let nick = localStorage.getItem('nick') ?? '';

	$: localStorage.setItem('nick', nick);
</script>

<main>
	<h1>Spork.IO</h1>

	<div class="join">
		<input
			type="text"
			class="nickname"
			placeholder="Nickname"
			maxlength="12"
			bind:value={nick}
		/>
		<div class="list">
			<ServerList />
		</div>
		<button on:click={() => ($page = 'game')}>Join</button>
	</div>
</main>

<style lang="scss">
	@import '../colors.scss';

	main {
		display: grid;
		width: 100%;
		height: 100%;

		grid: repeat(5, 1fr) / repeat(5, 1fr);

		background-image: radial-gradient(transparent, black), url(mapbg.png);
		background-position: center;
		background-size: cover;

		h1 {
			font-family: 'Rowdies', sans-serif;
			grid-area: 1 / 3;

			font-size: 5vw;

			text-align: center;
			color: $Primary;
			text-shadow: 0 0 1vh $Primary;
		}

		.join {
			display: grid;

			grid: repeat(7, 1fr) / repeat(5, 1fr);
			gap: 5px;

			padding: 5% 5%;

			grid-area: 2 / 3 / span 3 / span 1;

			background: #b0ceff44;
			backdrop-filter: blur(10px) brightness(0.9) grayscale(10%);

			border-radius: 10px;

			box-shadow: 0 0 30px black;

			button {
				grid-area: 7 / 2 / span 1 / span 3;

				font-family: 'Cousine';
				font-size: 4vh;

				background: $Secondary;

				outline: none;
				border: none;
				border-radius: 10px;

				transition-duration: 50ms;

				&:hover {
					box-shadow: 0 0 20px $Primary;
					transform: translateY(-10px);
					cursor: pointer;
				}

				&:active {
					transform: translateY(0);
					box-shadow: 0 0 10px $Primary;
				}
			}

			.list {
				grid-area: 3 / 2 / span 3 / span 3;
			}

			.nickname {
				grid-area: 1 / 1 / span 1 / span 5;

				font-family: 'Cousine', sans-serif;

				text-align: center;
				font-size: 2vw;
				color: $Text2;

				outline: none;
				background: none;
				border: none;
				border-bottom: 5px solid $Secondary;
				transition: 50ms;

				&::placeholder {
					color: lightgray;
				}

				&:focus {
					box-shadow: 0 0 30px black;
					transform: translateY(-10px);
					border-bottom: 10px solid $Secondary;
					background: gray;
					border-radius: 10px;
				}
			}
		}
	}
</style>

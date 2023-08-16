<script lang="ts">
	import { writable } from 'svelte/store';
	import ServerListItem from './ServerListItem.svelte';
	import { onDestroy, onMount } from 'svelte';

	const list = ['yupyupyup'];
	if (import.meta.env.DEV) list.unshift('http://localhost:5100');

	const selected = writable(list.indexOf(localStorage.getItem('server')));

	$: if ($selected < 0) $selected = 0;
	$: if ($selected >= list.length) $selected = list.length - 1;

	$: localStorage.setItem('server', list[$selected]);

	async function get(resource: RequestInfo | URL) {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 10);

		const response = (await fetch(resource, {
			signal: controller.signal,
		})
			.then((r) => r.json())
			.catch(() => ({
				online: false,
				name: 'Unavailable',
				playerCount: 0,
			}))) as {
			online: boolean;
			name: string;
			playerCount: number;
		};
		clearTimeout(id);

		return response;
	}

	const results = writable(Promise.all(list.map(get)));
	let refresh: number;

	onMount(() => {
		refresh = setInterval(() => results.set(Promise.all(list.map(get))), 5000);
	});

	onDestroy(() => {
		if (refresh !== undefined) clearInterval(refresh);
	});
</script>

<div>
	{#await $results then sdata}
		{#each sdata as d, index}
			<ServerListItem {...d} {index} {selected} />
		{/each}
	{/await}
</div>

<style lang="scss">
	div {
		display: flex;
		width: 100%;
		height: 100%;

		flex-direction: column;
		gap: 5px;

		overflow: auto;

		border-radius: 10px;
		backdrop-filter: brightness(0.1);
		transition-duration: 100ms;

		&:hover {
			box-shadow: 0 0 30px black;
			transform: translateY(-10px);
		}

		&::-webkit-scrollbar {
			width: 10px;
		}

		/* Track */
		&::-webkit-scrollbar-track {
			background: #f1f1f1;
		}

		/* Handle */
		&::-webkit-scrollbar-thumb {
			background: #888;
		}

		/* Handle on hover */
		&::-webkit-scrollbar-thumb:hover {
			background: #555;
		}
	}
</style>

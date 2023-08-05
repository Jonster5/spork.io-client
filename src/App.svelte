<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import Title from './pages/Title.svelte';
	import Game from './pages/Game.svelte';

	const page: Writable<'title' | 'game'> = writable('title');
</script>

{#if $page === 'title'}
	<Title {page} />
{:else}
	<Game />
{/if}

import type { ECS, Resource } from 'raxis';
import { Assets, Canvas, Handle, loadImageFile, loadImageInto, loadImages } from 'raxis-plugins';
import type Game from '../pages/Game.svelte';

export const toolAssets = {
	wood: ['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', './missing.png'],
	stone: ['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', './missing.png'],
	melee: ['./missing.png', './missing.png', './missing.png', './missing.png'],
	projectile: ['./missing.png', './missing.png', './missing.png', './missing.png'],
} as const;

const npcAssets = {
	pig: ['./npc/pig1.png'],
};

export const blockAssets = {
	wall: [
		['wood', './block/wall-wood.png'],
		['stone', './block/wall-stone.png'],
		['reinforced', './block/wall-reinforced.png'],
	],
	door: [
		['wood', './block/door-wood.png'],
		['stone', './block/door-stone.png'],
		['reinforced', './block/door-reinforced.png'],
	],
	spikes: [
		['wood', './block/spikes-wood.png'],
		['stone', './block/spikes-stone.png'],
		['reinforced', './block/spikes-reinforced.png'],
	],
} as const;

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets);
	const [canvas] = ecs.query([Canvas]).single();

	const loadImagesToRenderer = (...urls: string[]) =>
		loadImages(...urls).then((imgs) => Promise.all(imgs.map((i) => loadImageInto(canvas, i))));

	assets['wood-tools'] = await loadImagesToRenderer(...toolAssets.wood);
	assets['stone-tools'] = await loadImagesToRenderer(...toolAssets.stone);

	assets['tree'] = await loadImageInto(canvas, await loadImageFile('./tree.png'));
	assets['rock'] = await loadImageInto(canvas, await loadImageFile('./rock.png'));

	assets['pig'] = await loadImagesToRenderer(...npcAssets.pig);

	assets['missing'] = await loadImageInto(canvas, await loadImageFile('./missing.png'));

	assets['blocks'] = {};
	for (const key in blockAssets) {
		for (const [name, url] of blockAssets[key]) {
			assets['blocks'][`${key}-${name}`] = await loadImagesToRenderer(...[url]);
			console.log(`${key}-${name}`, assets['blocks'][`${key}-${name}`]);
		}
	}
}

export function LoadAssetsPlugin(ecs: ECS) {
	ecs.addStartupSystem(loadAssets);
}

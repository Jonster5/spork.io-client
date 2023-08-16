import type { ECS } from 'raxis';
import { Assets, Canvas, loadImageFile, loadImageInto, loadImages } from 'raxis-plugins';

export const toolAssets = {
	wood: ['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', './Tools/missing.png'],
	stone: ['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', './Tools/missing.png'],
	melee: ['./Tools/missing.png', './Tools/missing.png', './Tools/missing.png', './Tools/missing.png'],
	projectile: ['./Tools/missing.png', './Tools/missing.png', './Tools/missing.png', './Tools/missing.png'],
} as const;

const blockAssets = {
	water: [
		'./blocks/water1.png',
		'./blocks/water2.png',
		'./blocks/water3.png',
		'./blocks/water4.png',
		'./blocks/water5.png',
		'./blocks/water6.png',
	],
} as const;

const npcAssets = {
	pig: ['./npcs/pig1.png'],
};

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets);
	const [canvas] = ecs.query([Canvas]).single();

	assets['wood-tools'] = await loadImages(...toolAssets.wood).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['stone-tools'] = await loadImages(...toolAssets.stone).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['tree'] = await loadImageInto(canvas, await loadImageFile('./tree.png'));
	assets['rock'] = await loadImageInto(canvas, await loadImageFile('./rock.png'));

	assets['water'] = await loadImages(...blockAssets.water).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['pig'] = await loadImages(...npcAssets.pig).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);
}

export function LoadAssetsPlugin(ecs: ECS) {
	ecs.addStartupSystem(loadAssets);
}

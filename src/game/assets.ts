import type { ECS } from 'raxis';
import { Assets, Canvas, loadImageFile, loadImageInto, loadImages } from 'raxis-plugins';

export const toolAssets = {
	wood: ['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', ''],
	stone: ['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', ''],
	melee: ['', '', '', ''],
	projectile: ['', '', '', ''],
} as const;

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets);
	const [canvas] = ecs.query([Canvas]).single();

	assets['axes'] = await loadImages(...toolAssets.wood).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['picks'] = await loadImages(...toolAssets.stone).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['tree'] = await loadImageInto(canvas, await loadImageFile('./tree.png'));
	assets['rock'] = await loadImageInto(canvas, await loadImageFile('./rock.png'));
}

export function LoadAssetsPlugin(ecs: ECS) {
	ecs.addStartupSystem(loadAssets);
}

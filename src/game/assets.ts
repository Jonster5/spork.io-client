import type { ECS } from 'raxis';
import {
	Assets,
	Canvas,
	loadImageFile,
	loadImageInto,
	loadImages,
} from 'raxis-plugins';

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets);
	const [canvas] = ecs.query([Canvas]).single();

	const toolSrc = [
		[
			'./Tools/wood_axe.png',
			'./Tools/iron_axe.png',
			'./Tools/diamond_axe.png',
			'./Tools/missing.png',
		],
		[
			'./Tools/wood_pick.png',
			'./Tools/iron_pick.png',
			'./Tools/diamond_pick.png',
			'./Tools/missing.png',
		],
		['', '', '', ''],
		['', '', '', ''],
	];

	assets['axes'] = await loadImages(...toolSrc[0]).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['picks'] = await loadImages(...toolSrc[1]).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['tree'] = await loadImageInto(
		canvas,
		await loadImageFile('./tree.png')
	);
	assets['rock'] = await loadImageInto(
		canvas,
		await loadImageFile('./rock.png')
	);
}

export function LoadAssetsPlugin(ecs: ECS) {
	ecs.addStartupSystem(loadAssets);
}

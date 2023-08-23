import type { ECS } from 'raxis';
import { Assets, Canvas, loadImageFile, loadImageInto, loadImages } from 'raxis-plugins';

export const toolAssets = {
	wood: ['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', './Tools/missing.png'],
	stone: ['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', './Tools/missing.png'],
	melee: ['./Tools/missing.png', './Tools/missing.png', './Tools/missing.png', './Tools/missing.png'],
	projectile: ['./Tools/missing.png', './Tools/missing.png', './Tools/missing.png', './Tools/missing.png'],
} as const;

const npcAssets = {
	pig: ['./npc/pig1.png'],
	chicken: ['./npc/chicken1.png'],
	bear: ['./npc/bear1.png'],
	fish: ['./npc/fish1.png'],
	jelly: ['./npc/jelly1.png'],
	wolf: ['./npc/wolf1.png'],
	scorpion: ['./npc/scorpion1.png'],
	shark: ['./npc/shark1.png'],
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

	assets['pig'] = await loadImages(...npcAssets.pig).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['chicken'] = await loadImages(...npcAssets.chicken).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['bear'] = await loadImages(...npcAssets.bear).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['fish'] = await loadImages(...npcAssets.fish).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['jelly'] = await loadImages(...npcAssets.jelly).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['wolf'] = await loadImages(...npcAssets.wolf).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['scorpion'] = await loadImages(...npcAssets.scorpion).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);

	assets['shark'] = await loadImages(...npcAssets.shark).then((imgs) =>
		Promise.all(imgs.map((i) => loadImageInto(canvas, i)))
	);
}

export function LoadAssetsPlugin(ecs: ECS) {
	ecs.addStartupSystem(loadAssets);
}

import type { ECS } from "raxis";
import { Assets, loadImageFile, loadImages } from "raxis-plugins";

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets)

    const toolSrc = [
		['./Tools/wood_axe.png', './Tools/iron_axe.png', './Tools/diamond_axe.png', './Tools/missing.png'],
		['./Tools/wood_pick.png', './Tools/iron_pick.png', './Tools/diamond_pick.png', './Tools/missing.png'],
		['', '', '', ''],
		['', '', '', ''],
	];

    assets['axes'] = await loadImages(...toolSrc[0])
    assets['picks'] = await loadImages(...toolSrc[1])
    assets['tree'] = await loadImageFile('./tree.png')
    assets['rock'] = await loadImageFile('./rock.png')
}

export function LoadAssetsPlugin(ecs: ECS) {
    ecs.addStartupSystem(loadAssets)
}
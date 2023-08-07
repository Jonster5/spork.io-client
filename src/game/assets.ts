import type { ECS } from "raxis";
import { Assets, loadImageFile } from "raxis-plugins";

async function loadAssets(ecs: ECS) {
	const assets = ecs.getResource(Assets)

    assets['axe'] = await loadImageFile('iron_axe.png')
}

export function LoadAssetsPlugin(ecs: ECS) {
    ecs.addStartupSystem(loadAssets)
}
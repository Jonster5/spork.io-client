import { ECS, Resource } from 'raxis';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
import { PlayerPlugin } from './player';
import { RemotePlugin } from './remote';
import { MinimapPlugin } from './minimap';
import { LoadChunksPlugin } from './loadchunks';
import { UIData, UIPlugin } from './ui';
import { HealthPlugin } from './health';
import { InventoryPlugin } from './inventory';
import { ToolsPlugin } from './tools';

export class GameInitData extends Resource {
	constructor(public username: string, public url: string) {
		super();
	}
}

export function createGame(
	target: HTMLElement,
	ui: UIData,
	username: string,
	url: string
) {
	return new ECS()
		.insertPlugins(...defaultPlugins)
		.insertPlugins(
			PlayerPlugin,
			RemotePlugin,
			MinimapPlugin,
			LoadChunksPlugin,
			UIPlugin,
			HealthPlugin,
			ToolsPlugin,
			InventoryPlugin
		)
		.insertResource(
			new CanvasSettings({
				target,
				width: 3000,
			})
		)
		.insertResource(new GameInitData(username, url))
		.insertResource(new KeysToTrack(['KeyW', 'KeyA', 'KeyS', 'KeyD']))
		.insertResource(ui);
}

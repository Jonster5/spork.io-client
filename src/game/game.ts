import { ECS } from 'raxis';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
import { PlayerPlugin } from './player';
import { RemotePlugin } from './remote';
import { MinimapPlugin } from './minimap';
import { LoadChunksPlugin } from './loadchunks';

export function createGame(target: HTMLElement) {
	return new ECS()
		.insertPlugins(...defaultPlugins)
		.insertPlugins(PlayerPlugin, RemotePlugin, MinimapPlugin, LoadChunksPlugin)
		.insertResource(
			new CanvasSettings({
				target,
				width: 2000,
			})
		)
		.insertResource(new KeysToTrack(['KeyW', 'KeyA', 'KeyS', 'KeyD']));
}

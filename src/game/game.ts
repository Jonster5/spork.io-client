import { ECS } from 'raxis';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
import { PlayerPlugin } from './player';
import { RemotePlugin } from './remote';

export function createGame(target: HTMLElement) {
	return new ECS()
		.insertPlugins(...defaultPlugins)
		.insertPlugins(PlayerPlugin, RemotePlugin)
		.insertResource(
			new CanvasSettings({
				target,
				width: 2000,
			})
		)
		.insertResource(new KeysToTrack(['KeyW', 'KeyA', 'KeyS', 'KeyD']));
}

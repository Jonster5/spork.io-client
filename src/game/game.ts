import { ECS, Resource } from 'raxis';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
import { PlayerPlugin } from './player';
import { RemotePlugin } from './remote';

export class GameInitData extends Resource {
	constructor(public username: string, public url: string) {
		super();
	}
}

export function createGame(target: HTMLElement, username: string, url: string) {
	return new ECS()
		.insertPlugins(...defaultPlugins)
		.insertPlugins(PlayerPlugin, RemotePlugin)
		.insertResource(
			new CanvasSettings({
				target,
				width: 2000,
			})
		)
		.insertResource(new GameInitData(username, url))
		.insertResource(new KeysToTrack(['KeyW', 'KeyA', 'KeyS', 'KeyD']));
}

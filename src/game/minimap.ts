import { ECS, ECSEvent, Resource, Vec2, Component } from 'raxis';
import { Sprite, Transform } from 'raxis-plugins';
import { MapLoadedEvent, Player } from './player';

export class LoadMinimapEvent extends ECSEvent {
	constructor(public minimapData: ArrayBuffer) {
		super();
	}
}

export class Minimap extends Component {
	constructor() {
		super();
	}
}

export class PlayerMapIcon extends Component {
	constructor() {
		super();
	}
}

function loadMinimap(ecs: ECS) {
	ecs.getEventReader(LoadMinimapEvent)
		.get()
		.forEach((event) => {
			const size = new Uint16Array(event.minimapData.slice(0, 4));
			const pixelsRaw = new Uint8Array(event.minimapData.slice(4));
			const imageData = new ImageData(size[0], size[1]);

			for (let i = 0; i < pixelsRaw.length; i++) {
				switch (pixelsRaw[i]) {
					case 0:
						imageData.data[i * 4 + 0] = 128;
						imageData.data[i * 4 + 1] = 255;
						imageData.data[i * 4 + 2] = 128;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 1:
						imageData.data[i * 4 + 0] = 0;
						imageData.data[i * 4 + 1] = 128;
						imageData.data[i * 4 + 2] = 0;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 2:
						imageData.data[i * 4 + 0] = 255;
						imageData.data[i * 4 + 1] = 255;
						imageData.data[i * 4 + 2] = 128;

						imageData.data[i * 4 + 3] = 255;
						break;
					case 3:
						imageData.data[i * 4 + 0] = 156;
						imageData.data[i * 4 + 1] = 98;
						imageData.data[i * 4 + 2] = 0;

						imageData.data[i * 4 + 3] = 255;
						break;
					case 4:
						imageData.data[i * 4 + 0] = 0;
						imageData.data[i * 4 + 1] = 0;
						imageData.data[i * 4 + 2] = 255;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 5:
						imageData.data[i * 4 + 0] = 128;
						imageData.data[i * 4 + 1] = 128;
						imageData.data[i * 4 + 2] = 255;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 6:
						imageData.data[i * 4 + 0] = 128;
						imageData.data[i * 4 + 1] = 128;
						imageData.data[i * 4 + 2] = 128;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 7:
						imageData.data[i * 4 + 0] = 208;
						imageData.data[i * 4 + 1] = 0;
						imageData.data[i * 4 + 2] = 0;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 255:
						imageData.data[i * 4 + 0] = 100;
						imageData.data[i * 4 + 1] = 100;
						imageData.data[i * 4 + 2] = 100;
						imageData.data[i * 4 + 3] = 255;
						break;
					case 254:
						imageData.data[i * 4 + 0] = 0;
						imageData.data[i * 4 + 1] = 255;
						imageData.data[i * 4 + 2] = 0;
						imageData.data[i * 4 + 3] = 255;
						break;
				}
			}

			const canvas = new OffscreenCanvas(size[0], size[1]);
			const ctx = canvas.getContext('2d');

			ctx.translate(size[0] / 2, size[1] / 2);
			ctx.putImageData(imageData, 0, 0);

			ecs.spawn(
				new Minimap(),
				Transform.create(new Vec2(400, 400)),
				new Sprite('image', [canvas], 1)
			);
			ecs.spawn(
				new PlayerMapIcon(),
				Transform.create(new Vec2(5, 5)),
				new Sprite('rectangle', 'black', 2)
			);

			ecs.getEventWriter(MapLoadedEvent).send(new MapLoadedEvent());
		});
}

export function MinimapPlugin(ecs: ECS) {
	ecs.addComponentTypes(Minimap, PlayerMapIcon)
		.addEventType(LoadMinimapEvent)
		.addMainSystem(loadMinimap);
}

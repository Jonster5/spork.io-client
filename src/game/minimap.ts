import { ECS, ECSEvent, Resource, Vec2, Component } from 'raxis';
import { Canvas, Sprite, Transform, loadImageInto } from 'raxis-plugins';
import { MapLoadedEvent, Player } from './player';
import { UIData } from './ui';

export class LoadMinimapEvent extends ECSEvent {
	constructor(public minimapData: ArrayBuffer) {
		super();
	}
}

function loadMinimap(ecs: ECS) {
	ecs.getEventReader(LoadMinimapEvent)
		.get()
		.forEach(async (event) => {
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

			const { mapdata } = ecs.getResource(UIData);
			mapdata.set(imageData);

			ecs.getEventWriter(MapLoadedEvent).send(new MapLoadedEvent());
		});
}

export function MinimapPlugin(ecs: ECS) {
	ecs.addEventType(LoadMinimapEvent).addMainSystem(loadMinimap);
}

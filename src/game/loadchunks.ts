import { Component, Vec2, type ECS, With, Entity, Resource } from 'raxis';
import {
	Assets,
	Canvas,
	Handle,
	SocketMessageEvent,
	Sprite,
	Transform,
	checkTimer,
	decodeString,
	encodeString,
	getSocket,
	setTimer,
	stitch,
	unstitch,
} from 'raxis-plugins';
import { Player } from './player';
import { LoadMinimapEvent } from './minimap';
import { Health } from './health';

export class Chunk extends Component {
	constructor(public position: Vec2, public biome: number, public gen: bigint) {
		super();
	}
}

// Contingent - size of the map funny
export class LoadedMap extends Component {
	constructor(public chunkEntities: Entity[][] = new Array(200).fill(null).map(() => new Array(200).fill(null))) {
		super();
	}
}

export class MapTracker extends Resource {
	existingChunks: Map<`${number},${number}`, number> = new Map();
}

export class BlockObject extends Component {
	constructor(public id: string) {
		super();
	}
}

export type BlockType = `${'wall' | 'door' | 'spikes'}-${'wood' | 'stone' | 'reinforced'}`;

export function blockTypeToNumber(type: BlockType) {
	switch (type) {
		case 'wall-wood':
			return 0;
		case 'wall-stone':
			return 1;
		case 'wall-reinforced':
			return 2;
		case 'door-wood':
			return 3;
		case 'door-stone':
			return 4;
		case 'door-reinforced':
			return 5;
		case 'spikes-wood':
			return 6;
		case 'spikes-stone':
			return 7;
		case 'spikes-reinforced':
			return 8;
		default:
			return -1;
	}
}

export function blockNumberToType(num: number): BlockType | 'none' {
	switch (num) {
		case 0:
			return 'wall-wood';
		case 1:
			return 'wall-stone';
		case 2:
			return 'wall-reinforced';
		case 3:
			return 'door-wood';
		case 4:
			return 'door-stone';
		case 5:
			return 'door-reinforced';
		case 6:
			return 'spikes-wood';
		case 7:
			return 'spikes-stone';
		case 8:
			return 'spikes-reinforced';
		default:
			return 'none';
	}
}

function enableMap(ecs: ECS) {
	ecs.getEventReader(LoadMinimapEvent)
		.get()
		.forEach((event) => {
			ecs.enableSystem(dropChunks);
		});
}

function dropChunks(ecs: ECS) {
	if (checkTimer(ecs)) return;
	if (ecs.query([Player]).empty()) return;

	const [{ pos }] = ecs.query([Transform], With(Player)).single();
	const { existingChunks } = ecs.getResource(MapTracker);

	for (const [coords, eid] of existingChunks.entries()) {
		if (ecs.entity(eid).get(Transform)?.pos.distanceToSq(pos) > (10 * 500) ** 2) {
			ecs.destroy(eid);
			existingChunks.delete(coords);
		}
	}

	setTimer(ecs, 1000);
}

function seedRandom(v: Vec2, seed: number = 0) {
	return Math.sin(v.dot(new Vec2(12.9898, 78.233)) + seed) * 43758.5453123;
}

function loadChunks(ecs: ECS) {
	const assets = ecs.getResource(Assets);
	const { existingChunks } = ecs.getResource(MapTracker);

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'chunks') return;

			const chunks = unstitch(body);

			for (const chunk of chunks) {
				const chunkData = unstitch(chunk);

				const [cx, cy] = new Int16Array(chunkData[0]);

				const gen: bigint = new BigUint64Array(chunkData[2])[0];
				const blocksData = unstitch(chunkData[3]);
				if (!existingChunks.has(`${cx},${cy}`)) {
					const [biome, obj] = new Uint16Array(chunkData[1]);

					const color = (() => {
						switch (biome) {
							case 0:
								return '#80ff80';
							case 1:
								return '#008000';
							case 2:
								return '#ffff80';
							case 3:
								return '#9c6200';
							case 4:
								return '#0000ff';
							case 5:
								return '#8080ff';
							case 6:
								return '#808080';
							case 7:
								return '#e00000';
						}
					})();

					const chunk = ecs.spawn(
						new Chunk(new Vec2(cx + 100, cy + 100), 0, gen),
						new Sprite('rectangle', color),
						Transform.create(new Vec2(498, 498), new Vec2(cx * 500 + 250, cy * 500 + 250))
					);

					if (obj === 1) {
						chunk.addChild(
							ecs.spawn(
								new Sprite('image', [assets['rock']], 1),
								Transform.create(new Vec2(250, 250), new Vec2(0, 0))
							)
						);
					} else if (obj === 2) {
						chunk.addChild(
							ecs.spawn(
								new Sprite('image', [assets['tree']], 1),
								Transform.create(new Vec2(250, 250), new Vec2(0, 0))
							)
						);
					}

					for (let i = 0; i < 25; i++) {
						const block = makeBlock(ecs, assets, blocksData[i], i);
						if (!block) continue;
						chunk.addChild(block);
					}

					existingChunks.set(`${cx},${cy}`, chunk.id());
				} else if (ecs.entity(existingChunks.get(`${cx},${cy}`)).get(Chunk).gen !== gen) {
					const chunk = ecs.entity(existingChunks.get(`${cx},${cy}`));

					chunk.children(With(BlockObject)).forEach((eid) => ecs.destroy(eid));

					for (let i = 0; i < 25; i++) {
						const block = makeBlock(ecs, assets, blocksData[i], i);
						if (!block) continue;
						chunk.addChild(block);
					}

					ecs.entity(existingChunks.get(`${cx},${cy}`)).get(Chunk).gen = gen;
				}
			}
		});
}

function makeBlock(ecs: ECS, assets: Assets, blockdata: ArrayBuffer, i: number) {
	const rawBlockData = unstitch(blockdata);
	if (rawBlockData.length === 1) return;

	const pos = new Vec2(-200, 200).add(new Vec2((i % 5) * 100, Math.floor(i / 5) * -100));
	const id = decodeString(rawBlockData[0]);
	const bt = blockNumberToType(new Uint8Array(rawBlockData[1])[0]);
	const bh = new Uint16Array(rawBlockData[2])[0];

	const material: Handle[] = bt !== 'none' ? assets.blocks[bt] : [assets['missing']];

	return ecs.spawn(
		new BlockObject(id),
		new Sprite('image', material, 1),
		new Health(bh),
		Transform.create(new Vec2(102, 102), pos)
	);
}

export function LoadChunksPlugin(ecs: ECS) {
	ecs.insertResource(new MapTracker())
		.addComponentTypes(Chunk, LoadedMap, BlockObject)
		.addMainSystems(dropChunks, enableMap, loadChunks);
	ecs.disableSystem(dropChunks);
}

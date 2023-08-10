import { Component, Vec2, type ECS, With, Entity } from 'raxis';
import {
	Assets,
	Canvas,
	SocketMessageEvent,
	Sprite,
	Transform,
	checkTimer,
	encodeString,
	getSocket,
	setTimer,
	stitch,
} from 'raxis-plugins';
import { Player } from './player';
import { LoadMinimapEvent } from './minimap';

export class Chunk extends Component {
	constructor(public position: Vec2, public biome: number) {
		super();
	}
}

export class LoadedMap extends Component {
	constructor(public chunkEntities: Entity[] = []) {
		super();
	}
}

function enableMap(ecs: ECS) {
	ecs.getEventReader(LoadMinimapEvent)
		.get()
		.forEach((event) => {
			ecs.enableSystem(dropChunks);
			ecs.enableSystem(requestChunks);
		});
}

function dropChunks(ecs: ECS) {
	if (checkTimer(ecs)) return;

	const [playerTransform] = ecs.query([Transform], With(Player)).single();
	const gridPosition = playerTransform.pos.clone().div(500).floor();
	const loadedChunks = ecs.query([Chunk]).results();
	const [map] = ecs.query([LoadedMap], With(Player)).single();

	let offset = 0;
	loadedChunks.forEach(([chunk], i) => {
		if (
			Math.abs(chunk.position.x - gridPosition.x) >= 10 ||
			Math.abs(chunk.position.y - gridPosition.y) >= 10
		) {
			map.chunkEntities[i - offset].destroy();
			map.chunkEntities.splice(i - offset, 1);
			offset++;
		}
	});

	setTimer(ecs, 1000);
}

function requestChunks(ecs: ECS) {
	if (checkTimer(ecs)) return;

	const socket = getSocket(ecs, 'game');

	const [playerTransform] = ecs.query([Transform], With(Player)).single();
	const gridPosition = playerTransform.pos.clone().div(500).floor();
	const [{ pid }] = ecs.query([Player]).single();

	const requestedChunks: number[][] = [];
	const loadedChunks = ecs.query([Chunk]).results();

	for (let i = 0; i < 11; i++) {
		for (let j = 0; j < 11; j++) {
			let unloaded = true;
			for (let [loadedChunk] of loadedChunks) {
				if (
					loadedChunk.position.x == gridPosition.x + j - 5 &&
					loadedChunk.position.y == gridPosition.y + i - 5
				) {
					unloaded = false;
					break;
				}
			}
			if (unloaded)
				requestedChunks.push([
					gridPosition.x + j - 5,
					gridPosition.y + i - 5,
				]);
		}
	}

	const uuidbuffer = encodeString(pid);
	const requestChunkBuffer = new ArrayBuffer(4 * requestedChunks.length);

	requestedChunks.forEach((chunk, i) => {
		new DataView(requestChunkBuffer).setInt16(i * 4 + 0, chunk[0], true);
		new DataView(requestChunkBuffer).setInt16(i * 4 + 2, chunk[1], true);
	});

	socket.send('chunks', stitch(uuidbuffer, requestChunkBuffer));
	setTimer(ecs, 100);
}

function seedRandom(v: Vec2, seed: number = 0) {
	return (Math.sin(v.dot(new Vec2(12.9898,78.233))+seed)*43758.5453123)
}

function loadChunks(ecs: ECS) {
	const assets = ecs.getResource(Assets)

	if (checkTimer(ecs)) return;
	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach((event) => {
			if (
				event.socket.label !== 'game' ||
				event.type !== 'chunks-permitted'
			)
				return;

			const biomes = new Uint8Array(
				event.body.slice(0, event.body.byteLength / 6)
			);
			const objects = new Uint8Array(
				event.body.slice(event.body.byteLength / 6, event.body.byteLength / 3)
			);
			const chunks = new Int16Array(
				event.body.slice(event.body.byteLength / 3)
			);
			const [map] = ecs.query([LoadedMap], With(Player)).single();
			const loadedChunks = ecs.query([Chunk]).results();

			for (let i = 0; i < chunks.length; i += 2) {
				let chunkOverlap = false;
				loadedChunks.forEach(([chunk]) => {
					if (
						chunk.position.equals(
							new Vec2(chunks[i], chunks[i + 1])
						)
					)
						chunkOverlap = true;
				});
				if (!chunkOverlap) {
					let color = 'black';
					switch (biomes[i / 2]) {
						case 0:
							color = '#80ff80';
							break;
						case 1:
							color = '#008000';
							break;
						case 2:
							color = '#ffff80';
							break;
						case 3:
							color = '#9c6200';
							break;
						case 4:
							color = '#0000ff';
							break;
						case 5:
							color = '#8080ff';
							break;
						case 6:
							color = '#808080';
							break;
						case 7:
							color = '#e00000';
							break;
					}

					const chunk = ecs.spawn(
						new Chunk(new Vec2(chunks[i], chunks[i + 1]), 0),
						new Sprite('rectangle', color),
						new Transform(
							new Vec2(498, 498),
							new Vec2(chunks[i] * 500 + 250, chunks[i + 1] * 500 + 250)
						)
					);

					if (objects[i/2] == 1) {
						chunk.addChild(
							ecs.spawn(
								new Sprite('image', [assets['rock']], 1), 
								new Transform(
									new Vec2(250,250), 
									new Vec2(0, 0)
								)
							)
						)
					}

					if (objects[i/2] == 2) {
						chunk.addChild(
							ecs.spawn(
								new Sprite('image', [assets['tree']], 1), 
								new Transform(
									new Vec2(250,250), 
									new Vec2(0, 0)
								)
							)
						)
					}

					map.chunkEntities.push(chunk);
				}
			}
		});
	setTimer(ecs, 100);
}

export function LoadChunksPlugin(ecs: ECS) {
	ecs.addComponentTypes(Chunk, LoadedMap).addMainSystems(
		dropChunks,
		requestChunks,
		enableMap,
		loadChunks
	);
	ecs.disableSystem(dropChunks);
	ecs.disableSystem(requestChunks);
}

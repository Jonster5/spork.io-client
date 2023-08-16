import { Component, With, type ECS, ECSEvent, Vec2, QuadIn, Entity } from 'raxis';
import {
	Assets,
	Canvas,
	Inputs,
	SocketMessageEvent,
	Sprite,
	Transform,
	Tween,
	InputEvent,
	TweenManager,
	addTween,
	createSocket,
	decodeString,
	encodeString,
	getSocket,
	removeTween,
	stitch,
	tweenIsDone,
	unstitch,
	globalPos,
} from 'raxis-plugins';
import { GameInitData } from './game';
import { LoadMinimapEvent, Minimap, PlayerMapIcon } from './minimap';
import { Chunk, LoadedMap } from './loadchunks';
import { Health } from './health';
import { Inventory } from './inventory';
import { ToolDisplay, Tools, type ToolTier } from './tools';
import { Flags } from './flags';

export class MapLoadedEvent extends ECSEvent {
	constructor() {
		super();
	}
}

export class BlockHighlight extends Component {
	constructor() {
		super()
	}
}

export class Player extends Component {
	constructor(public pid: string) {
		super();
	}
}

function setupSocket(ecs: ECS) {
	const { url } = ecs.getResource(GameInitData);

	createSocket(ecs, 'game', `ws://${new URL(url).host}/game`);
}

function playerMovement(ecs: ECS) {
	const { keymap } = ecs.getResource(Inputs);
	const [{ vel }] = ecs.query([Transform], With(Player)).single();

	vel.set(0, 0);

	if (keymap.get('KeyA').isDown) vel.x -= 500;
	if (keymap.get('KeyS').isDown) vel.y -= 500;
	if (keymap.get('KeyW').isDown) vel.y += 500;
	if (keymap.get('KeyD').isDown) vel.x += 500;

	vel.clampMag(0, 500);

	const clicking = ecs.getResource(Inputs).pointer.isDown ? 1 : 0;
	const player = ecs.query([Player]).entity();
	const [toolTransform] = ecs.query([Transform], With(ToolDisplay)).single();
	if (clicking && tweenIsDone(player, 'tool-rotate')) {
		removeTween(player, 'tool-rotate');
		toolTransform.angle = 0;
		addTween(player, 'tool-rotate', new Tween(toolTransform, { angle: -Math.PI / 2 }, 500, QuadIn));
	}
	const [toolSprite] = ecs.query([Sprite], With(ToolDisplay)).single();
	const flags = player.get(Flags);
	const tools = player.get(Tools);

	// CONTINGENT - The 4 here is the number of tiers of tool. I couldn't think of a better way to implement this
	// besides adding a sprite for every type of tool and hiding them if you're not holding them
	toolSprite.index =
		tools[flags.selectedTool] + 4 * (flags.selectedTool === 'wood' ? 0 : flags.selectedTool === 'stone' ? 1 : 0);
}

function playerCollide(ecs: ECS) {
	const [transform] = ecs.query([Transform], With(Player)).single();
	const movement = transform.vel.clone()
	const chunks = ecs.query([Chunk]).results()
	const chunkEntities = ecs.query([Chunk]).entities().map((e) => ecs.entity(e))

	const chunkPos = transform.pos.clone().div(500).floor()
	chunks.forEach(([chunk], i) => {
		if (chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y) {
			console.log('fig')
			const blocks = chunkEntities[i].children().map((e) => ecs.entity(e) )
			blocks.forEach((block, i) => {
				const blockTransform = block.get(Transform);
				const blockPos = chunkEntities[i].get(Transform).pos.sub(block.get(Transform).pos.clone()).sub(250)
				const collision = AABB(transform, blockTransform, blockPos)
				if (collision[0]) {
					movement.x > 0 ? 
					transform.pos.x = blockPos.x - blockTransform.size.x : 
					transform.pos.x = blockPos.x + blockTransform.size.x
					movement.x = 0
				}
				if (collision[1]) {
					movement.y > 0 ? 
					transform.pos.y = blockPos.y - blockTransform.size.y : 
					transform.pos.y = blockPos.y + blockTransform.size.y
					movement.y = 0
				}
				transform.vel = movement
			})
		}
	});
}

function AABB(player: Transform, block: Transform, blockPos: Vec2) {
	
	console.log(player.pos, blockPos)
	const axes = [false, false]
	if (
		player.pos.x - player.size.x < blockPos.x + block.size.x &&
		player.pos.x + player.size.x > blockPos.x - block.size.x
	) { axes[0] = true } 
	if (
		player.pos.y - player.size.y < blockPos.y + block.size.y &&
		player.pos.y + player.size.y > blockPos.y - block.size.y
	) { axes[1] = true } 
	return axes
}

function translateCamera(ecs: ECS) {
	const [canvasTransform] = ecs.query([Transform], With(Canvas)).single();
	const [playerTransform] = ecs.query([Transform], With(Player)).single();
	const [minimapTransform] = ecs.query([Transform], With(Minimap)).single();
	const { pointer } = ecs.getResource(Inputs);

	const [iconTransform] = ecs.query([Transform], With(PlayerMapIcon)).single();

	const coolOffset = pointer.ray.pos.clone().sub(playerTransform.pos).div(-20);
	minimapTransform.pos.set(
		playerTransform.pos
			.clone()
			.add(
				new Vec2(
					canvasTransform.size.x / 2 - minimapTransform.size.x / 2,
					canvasTransform.size.y / 2 - minimapTransform.size.y / 2
				)
			)
			.sub(coolOffset)
	);
	iconTransform.pos.set(
		playerTransform.pos
			.clone()
			.add(
				new Vec2(
					canvasTransform.size.x / 2 - minimapTransform.size.x / 2 + playerTransform.pos.x / 250,
					canvasTransform.size.y / 2 - minimapTransform.size.y / 2 + playerTransform.pos.y / 250
				)
			)
			.sub(coolOffset)
	);
	playerTransform.angle = Vec2.unit(pointer.ray.pos.clone().sub(playerTransform.pos)).angle();
	canvasTransform.pos.set(playerTransform.pos.clone().mul(-1).add(coolOffset));

	const [blockHighlightTransform] = ecs.query([Transform], With(BlockHighlight)).single()
	blockHighlightTransform.pos.x = Math.floor((pointer.ray.pos.x)/100)*100+50
	blockHighlightTransform.pos.y = Math.floor((pointer.ray.pos.y)/100)*100+50
}

function recieveUpdate(ecs: ECS) {
	if (ecs.getEventReader(SocketMessageEvent).empty()) return;
	if (ecs.query([], With(Player)).empty()) return;

	const [{ pid }] = ecs.query([Player]).single();
	const [playerInv] = ecs.query([Inventory], With(Player)).single();
	const playerEntity = ecs.query([Player]).entity();

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'update') return;
			const update = unstitch(body);

			for (const data of update) {
				let unstitched = unstitch(data);
				const id = decodeString(unstitched[0]);
				const inventory = new Uint8Array(unstitched[2]);
				playerEntity.replace(Tools.deserialize(unstitched[3]));

				if (id !== pid) continue;

				playerInv.wood = inventory[0];
				playerInv.stone = inventory[1];
				playerInv.food = inventory[2];
				playerInv.gold = inventory[3];
			}
		});
}

function requestBlockPlace(ecs: ECS) {
	ecs.getEventReader(InputEvent<'pointerdown'>)
	.get()
	.filter(({ type }) => type === 'pointerdown')
	.forEach((event) => {
		const socket = getSocket(ecs, 'game');

		const [player] = ecs
		.query([Player])
		.single();
		const { pointer } = ecs.getResource(Inputs);

		const blockLocation = new Int16Array(2)
		blockLocation[0] = Math.floor((pointer.ray.pos.x)/100)
		blockLocation[1] = Math.floor((pointer.ray.pos.y)/100)

		socket.send('request-block-place', stitch(encodeString(player.pid), blockLocation.buffer));
	});
}

function updateServer(ecs: ECS) {
	if (ecs.query([], With(Player)).empty()) {
		ecs.disableSystem(updateServer);
		return;
	}
	const socket = getSocket(ecs, 'game');
	const [{ pid }, transform, tools, flags] = ecs.query([Player, Transform, Tools, Flags]).single();

	const update = stitch(encodeString(pid), transform.serializeUnsafe(), flags.serialize());

	socket.send('update', update);
}

function createPlayer(ecs: ECS) {
	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'init') return;
			if (!ecs.query([], With(Player)).empty()) return;

			const data = unstitch(body);
			const pid = decodeString(data[0]);
			const transform = Transform.create();
			transform.setFromBuffer(data[1]);
			const minimapData = data[2];
			const health = Health.deserialize(data[3]);
			const inventory = Inventory.deserialize(data[4]);
			const tools = Tools.deserialize(data[5]);
			const flags = Flags.deserialize(data[6]);

			const assets = ecs.getResource(Assets);

			ecs.getEventWriter(LoadMinimapEvent).send(new LoadMinimapEvent(minimapData));

			const player = ecs.spawn(
				new Player(pid),
				transform,
				new Sprite('rectangle', 'royalblue', 1),
				new LoadedMap(),
				health,
				inventory,
				tools,
				flags
			);

			const toolTransform = Transform.create(new Vec2(100, 100), new Vec2(100, 0), 0);
			player.addChild(
				ecs.spawn(
					new ToolDisplay(),
					new Sprite('image', [...assets['wood-tools'], ...assets['stone-tools']], 2),
					toolTransform
				)
			);
			ecs.spawn(
				new BlockHighlight(),
				new Sprite(
					'rectangle',
					'red',
					2,
					0.4
				),
				new Transform(new Vec2(100,100), new Vec2(0,0))
			)
		});
}

function enableSystems(ecs: ECS) {
	ecs.getEventReader(MapLoadedEvent)
		.get()
		.forEach(() => {
			ecs.enableSystem(updateServer);
			ecs.enableSystem(recieveUpdate);
			ecs.enableSystem(playerMovement);
			ecs.enableSystem(playerCollide);
			ecs.enableSystem(translateCamera);
		});
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentTypes(Player, BlockHighlight)
		.addEventType(MapLoadedEvent)
		.addStartupSystems(setupSocket)
		.addMainSystems(
			createPlayer,
			playerMovement,
			playerCollide,
			updateServer,
			recieveUpdate,
			translateCamera,
			enableSystems,
			requestBlockPlace
		);

	ecs.disableSystem(updateServer);
	ecs.disableSystem(recieveUpdate);
	ecs.disableSystem(playerMovement);
	ecs.disableSystem(playerCollide);
	ecs.disableSystem(translateCamera);
}

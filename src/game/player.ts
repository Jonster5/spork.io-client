import { Component, With, type ECS, ECSEvent, Vec2, QuadIn } from 'raxis';
import {
	Assets,
	Canvas,
	Inputs,
	SocketMessageEvent,
	Sprite,
	Transform,
	Tween,
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
} from 'raxis-plugins';
import { GameInitData } from './game';
import { LoadMinimapEvent, Minimap, PlayerMapIcon } from './minimap';
import { LoadedMap } from './loadchunks';
import { Health } from './health';
import { Inventory } from './inventory';
import { Tools } from './tools';

export class MapLoadedEvent extends ECSEvent {
	constructor() {
		super();
	}
}

export class Player extends Component {
	constructor(public pid: string) {
		super();
	}
}

export class Tool extends Component {

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

	const clicking = ecs.getResource(Inputs).pointer.isDown ? 1 : 0
	const player = ecs.query([Player]).entity()
	const [toolTransform] = ecs.query([Transform], With(Tool)).single()
	if (clicking && tweenIsDone(player, 'tool-rotate')) {
		removeTween(player, 'tool-rotate')
		toolTransform.angle = 0
		addTween(player, 'tool-rotate', new Tween(toolTransform, {angle: -Math.PI/2}, 500, QuadIn))
	}
}

function translateCamera(ecs: ECS) {
	const [canvasTransform] = ecs.query([Transform], With(Canvas)).single();
	const [playerTransform] = ecs.query([Transform], With(Player)).single();
	const [minimapTransform] = ecs.query([Transform], With(Minimap)).single();
	const { pointer } = ecs.getResource(Inputs)

	const [iconTransform] = ecs
		.query([Transform], With(PlayerMapIcon))
		.single();
	minimapTransform.pos.set(
		playerTransform.pos
			.clone()
			.add(
				new Vec2(
					canvasTransform.size.x / 2 - minimapTransform.size.x / 2,
					canvasTransform.size.y / 2 - minimapTransform.size.y / 2
				)
			)
	);
	iconTransform.pos.set(
		playerTransform.pos
			.clone()
			.add(
				new Vec2(
					canvasTransform.size.x / 2 -
						minimapTransform.size.x / 2 +
						playerTransform.pos.x / 250,
					canvasTransform.size.y / 2 -
						minimapTransform.size.y / 2 +
						playerTransform.pos.y / 250
				)
			)
	);
	playerTransform.angle = Vec2.unit(pointer.ray.pos.clone().sub(playerTransform.pos)).angle()
	canvasTransform.pos.set(playerTransform.pos.clone().mul(-1));
}

function recieveUpdate(ecs: ECS) {
	if (ecs.getEventReader(SocketMessageEvent).empty()) return;
	if (ecs.query([], With(Player)).empty()) return;

	const [{ pid }] = ecs.query([Player]).single();
	const [ playerInv ] = ecs.query([Inventory], With(Player)).single()

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'update') return;

			const update = unstitch(body);

			for (const data of update) {
				let unstitched = unstitch(data);
				const id = decodeString(unstitched[0]);
				const inventory = new Uint8Array(unstitched[2]);

				if (id !== pid) continue;

				playerInv.wood = inventory[0]
				playerInv.stone = inventory[1]
				playerInv.food = inventory[2]
				playerInv.gold = inventory[3]
				
			}
		});
	console.log(playerInv.wood)
}

function updateServer(ecs: ECS) {
	if (ecs.query([], With(Player)).empty()) {
		ecs.disableSystem(updateServer);
		return;
	}
	const socket = getSocket(ecs, 'game');
	const [{ pid }, t] = ecs.query([Player, Transform]).single();

	const flags = new Uint8Array([
		ecs.getResource(Inputs).pointer.isDown ? 1 : 0, // Is clicking
	]);
	const update = stitch(encodeString(pid), t.serialize(), flags.buffer);

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
			const transform = Transform.deserialize(data[1]);
			const minimapData = data[2];
			const health = Health.deserialize(data[3]);
			const inventory = Inventory.deserialize(data[4]);
			const tools = Tools.deserialize(data[5]);

			const assets = ecs.getResource(Assets)

			ecs.getEventWriter(LoadMinimapEvent).send(
				new LoadMinimapEvent(minimapData)
			);

			const player = ecs.spawn(
				new Player(pid),
				transform,
				new Sprite('rectangle', 'royalblue', 1),
				new LoadedMap(),
				health,
				inventory,
				tools
			)

			const toolTransform = new Transform(new Vec2(100,100), new Vec2(100,0), 0) 
			player.addChild(
				ecs.spawn(
					new Tool(),
					new Sprite('image', [assets['axe']], 2),
					toolTransform
				)
			);
			addTween(player, 'tool-rotate', new Tween(toolTransform, {angle: -Math.PI/2}, 500, QuadIn))
		});
}

function enableSystems(ecs: ECS) {
	ecs.getEventReader(MapLoadedEvent)
		.get()
		.forEach((event) => {
			ecs.enableSystem(updateServer);
			ecs.enableSystem(recieveUpdate);
			ecs.enableSystem(playerMovement);
			ecs.enableSystem(translateCamera);
		});
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentTypes(Player, Tool)
		.addEventType(MapLoadedEvent)
		.addStartupSystems(setupSocket)
		.addMainSystems(
			createPlayer,
			playerMovement,
			updateServer,
			recieveUpdate,
			translateCamera,
			enableSystems
		);

	ecs.disableSystem(updateServer);
	ecs.disableSystem(recieveUpdate);
	ecs.disableSystem(playerMovement);
	ecs.disableSystem(translateCamera);
}

import { Component, With, type ECS, ECSEvent, Vec2 } from 'raxis';
import {
	Canvas,
	Inputs,
	SocketMessageEvent,
	Sprite,
	Transform,
	createSocket,
	decodeString,
	encodeString,
	getSocket,
	stitch,
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
}

function translateCamera(ecs: ECS) {
	const [canvasTransform] = ecs.query([Transform], With(Canvas)).single();
	const [playerTransform] = ecs.query([Transform], With(Player)).single();
	const [minimapTransform] = ecs.query([Transform], With(Minimap)).single();

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
	canvasTransform.pos.set(playerTransform.pos.clone().mul(-1));
}

function updateServer(ecs: ECS) {
	if (ecs.query([], With(Player)).empty()) {
		ecs.disableSystem(updateServer);
		return;
	}
	const socket = getSocket(ecs, 'game');
	const [{ pid }, t] = ecs.query([Player, Transform]).single();

	const flags = new Uint8Array([
		0, // Is clicking
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

			ecs.getEventWriter(LoadMinimapEvent).send(
				new LoadMinimapEvent(minimapData)
			);

			ecs.spawn(
				new Player(pid),
				transform,
				new Sprite('rectangle', 'royalblue', 1),
				new LoadedMap(),
				health,
				inventory,
				tools
			);
		});
}

function enableSystems(ecs: ECS) {
	ecs.getEventReader(MapLoadedEvent)
		.get()
		.forEach((event) => {
			ecs.enableSystem(updateServer);
			ecs.enableSystem(playerMovement);
			ecs.enableSystem(translateCamera);
		});
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentType(Player)
		.addEventType(MapLoadedEvent)
		.addStartupSystems(setupSocket)
		.addMainSystems(
			createPlayer,
			playerMovement,
			updateServer,
			translateCamera,
			enableSystems
		);

	ecs.disableSystem(updateServer);
	ecs.disableSystem(playerMovement);
	ecs.disableSystem(translateCamera);
}

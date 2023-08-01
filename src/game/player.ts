import { Component, With, type ECS } from 'raxis';
import {
	Inputs,
	SocketMessageEvent,
	SocketOpenEvent,
	Sprite,
	Transform,
	createSocket,
	decodeString,
	encodeString,
	getSocket,
	stitch,
	unstitch,
} from 'raxis-plugins';

export class Player extends Component {
	constructor(public pid: string) {
		super();
	}
}

function setupSocket(ecs: ECS) {
	createSocket(ecs, 'game', 'ws://localhost:5100/game');
}

function disableSystems(ecs: ECS) {
	ecs.disableSystem(updateServer);
	ecs.disableSystem(playerMovement);
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

function updateServer(ecs: ECS) {
	if (ecs.query([], With(Player)).empty()) {
		ecs.disableSystem(updateServer);
		return;
	}
	const socket = getSocket(ecs, 'game');
	const [{ pid }, t] = ecs.query([Player, Transform]).single();

	const update = stitch(encodeString(pid), t.serialize());

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

			ecs.spawn(
				new Player(pid),
				transform,
				new Sprite('rectangle', 'royalblue')
			);

			ecs.enableSystem(updateServer);
			ecs.enableSystem(playerMovement);
		});
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentType(Player)
		.addStartupSystems(setupSocket, disableSystems)
		.addMainSystems(createPlayer, playerMovement, updateServer);
}

import { Component, With, type ECS, ECSEvent, Vec2 } from 'raxis';
import { Assets, SocketMessageEvent, Sprite, Transform, decodeString, unstitch } from 'raxis-plugins';
import { Player } from './player';
import { Inventory } from './inventory';
import { ToolDisplay, Tools } from './tools';
import { Flags } from './flags';

export class RemotePlayer extends Component {
	constructor(public rid: string) {
		super();
	}
}

export class AddRemoteEvent extends ECSEvent {
	constructor(public rid: string, public transform: Transform) {
		super();
	}

	clone() {
		return new AddRemoteEvent(this.rid, this.transform);
	}
}

function recieveUpdate(ecs: ECS) {
	if (ecs.getEventReader(SocketMessageEvent).empty()) return;
	if (ecs.query([], With(Player)).empty()) return;

	const remotes = ecs
		.query([], With(RemotePlayer))
		.entities()
		.map((e) => ecs.entity(e));

	const [{ pid }] = ecs.query([Player]).single();

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'player-update') return;

			const update = unstitch(body);

			for (const data of update) {
				let unstitched = unstitch(data);
				const id = decodeString(unstitched[0]);

				const transform = Transform.create();
				transform.setFromBuffer(unstitched[1]);
				const flags = Flags.deserialize(unstitched[4]) as Flags;
				const tools = Tools.deserialize(unstitched[3]);

				if (id === pid) continue;

				const remote = remotes.find((r) => r.get(RemotePlayer).rid === id);

				const rt = Transform.create();
				rt.setFromBuffer(unstitched[1]);

				if (!remote) {
					ecs.getEventWriter(AddRemoteEvent).send(new AddRemoteEvent(id, rt));
					continue;
				}

				remote.get(Transform).setFromBuffer(unstitched[1]);

				const toolSprite = remote.get(Sprite);
				toolSprite.index =
					tools[flags.selectedTool] +
					4 * (flags.selectedTool === 'wood' ? 0 : flags.selectedTool === 'stone' ? 1 : 0);
			}
		});
}

function addRemote(ecs: ECS) {
	ecs.getEventReader(AddRemoteEvent)
		.get()
		.forEach(({ rid, transform }) => {
			const assets = ecs.getResource(Assets);
			const remotePlayer = ecs.spawn(new RemotePlayer(rid), transform, new Sprite('rectangle', 'tomato', 1));

			const toolTransform = Transform.create(new Vec2(100, 100), new Vec2(100, 0), 0);
			remotePlayer.addChild(
				ecs.spawn(new Sprite('image', [...assets['wood-tools'], ...assets['stone-tools']], 2), toolTransform)
			);
		});
}

function removeRemote(ecs: ECS) {
	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'leave') return;

			const id = decodeString(body);

			const remotes = ecs
				.query([], With(RemotePlayer))
				.entities()
				.map((e) => ecs.entity(e));

			if (remotes.length < 1) return;

			for (const r of remotes) {
				if (r.get(RemotePlayer).rid !== id) continue;

				r.destroy();
				break;
			}
		});
}

export function RemotePlugin(ecs: ECS) {
	ecs.addComponentType(RemotePlayer)
		.addEventTypes(AddRemoteEvent)
		.addMainSystems(recieveUpdate, addRemote, removeRemote);
}

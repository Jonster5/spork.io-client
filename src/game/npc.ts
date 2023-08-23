import { Component, ECSEvent, type ECS, With, type System } from 'raxis';
import {
	Assets,
	SocketMessageEvent,
	Sprite,
	Transform,
	checkTimer,
	decodeString,
	encodeString,
	setTimer,
	stitch,
	unstitch,
} from 'raxis-plugins';
import { Health } from './health';
import { Player } from './player';

export type NPCType = 'pig' | 'chicken' | 'scorpion';

export class NPC extends Component {
	constructor(public nid: string, readonly type: NPCType) {
		super();
	}

	serialize(): ArrayBufferLike {
		return stitch(encodeString(this.nid), encodeString(this.type));
	}

	static deserialize(buffer: ArrayBufferLike) {
		const data = unstitch(buffer);
		return new NPC(decodeString(data[0]), decodeString(data[1]) as NPCType);
	}
}

export class AddNPCEvent extends ECSEvent {
	constructor(public npc: NPC, public t: Transform, public h: Health) {
		super();
	}

	clone() {
		return new AddNPCEvent(this.npc, this.t, this.h);
	}
}

export class RemoveNPCEvent extends ECSEvent {
	constructor(public eid: number) {
		super();
	}
}

function recieveNPCUpdate(ecs: ECS) {
	const npcs = ecs
		.query([], With(NPC))
		.entities()
		.map((e) => ecs.entity(e));

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'npc-update') return;

			for (const npcbuf of unstitch(body)) {
				const data = unstitch(npcbuf);

				const npcComp = NPC.deserialize(data[0]);
				const health = Health.deserialize(data[2]);

				const npc = npcs.find((e) => e.get(NPC).nid === npcComp.nid);
				if (npc === undefined) {
					const transform = Transform.create();
					transform.setFromBuffer(data[1]);
					ecs.getEventWriter(AddNPCEvent).send(new AddNPCEvent(npcComp, transform, health));
					return;
				}

				npc.get(Transform).setFromBuffer(data[1]);
				npc.get(Transform).vel.set(0, 0);
				npc.replace(health);
			}
		});
}

function addNPC(ecs: ECS) {
	const assets = ecs.getResource(Assets);

	ecs.getEventReader(AddNPCEvent)
		.get()
		.forEach(({ npc, t, h }) => {
			const entity = ecs.spawn(npc, t, h);

			switch (npc.type) {
				case 'pig':
					entity.insert(new Sprite('image', assets['pig'], 4));
					break;
				case 'chicken':
					entity.insert(new Sprite('image', assets['chicken'], 4));
					break;
				case 'scorpion':
					entity.insert(new Sprite('image', assets['scorpion'], 4));
					break;
			}
		});
}

function removeNPC(ecs: ECS) {
	ecs.getEventReader(RemoveNPCEvent)
		.get()
		.forEach(({ eid }) => {
			ecs.destroy(eid);
		});
}

function despawnFarNPCS(ecs: ECS) {
	if (checkTimer(ecs)) return;
	if (ecs.query([Player]).empty()) return;

	const [pt] = ecs.query([Transform], With(Player)).single();

	ecs.query([], With(NPC), With(Transform))
		.entities()
		.forEach((eid) => {
			if (ecs.entity(eid).get(Transform).pos.distanceToSq(pt.pos) > 10000 ** 2) {
				ecs.getEventWriter(RemoveNPCEvent).send(new RemoveNPCEvent(eid));
			}
		});

	setTimer(ecs, 1000);
}

export function NPCPlugin(ecs: ECS) {
	ecs.addComponentType(NPC)
		.addEventTypes(AddNPCEvent, RemoveNPCEvent)
		.addMainSystems(recieveNPCUpdate, addNPC, despawnFarNPCS, removeNPC);
}

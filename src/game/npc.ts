import { Component, ECSEvent, type ECS } from 'raxis';
import { SocketMessageEvent, unstitch } from 'raxis-plugins';

export class NPC extends Component {
	constructor(public nid: string) {
		super();
	}
}

export class AddNPCEvent extends ECSEvent {}

export class RemoveNPCEvent extends ECSEvent {}

function recieveNPCUpdate(ecs: ECS) {
	const npcs = ecs
		.query([])
		.entities()
		.map((e) => ecs.entity(e));

	ecs.getEventReader(SocketMessageEvent)
		.get()
		.forEach(({ socket, type, body }) => {
			if (socket.label !== 'game' || type !== 'npc-update') return;

			const data = unstitch(body);
		});
}

export function NPCPlugin(ecs: ECS) {
	ecs.addComponentType(NPC).addEventTypes(AddNPCEvent, RemoveNPCEvent).addMainSystem(recieveNPCUpdate);
}

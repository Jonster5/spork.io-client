import { ECS, ECSEvent, Resource, With } from 'raxis';
import { get, type Writable } from 'svelte/store';
import { Player } from './player';
import { Inventory } from './inventory';
import type { ToolList, ToolTier, ToolType } from './tools';
import { Flags } from './flags';
import { encodeString, getSocket, stitch } from 'raxis-plugins';

export class UIData extends Resource {
	constructor(
		public tools: Writable<ToolList>,
		public selectedTool: Writable<ToolType>,
		public wood: Writable<number>,
		public stone: Writable<number>,
		public food: Writable<number>,
		public gold: Writable<number>
	) {
		super();
	}
}

export class RequestUpgradeEvent extends ECSEvent {
	constructor(public tool: ToolType) {
		super();
	}
}

function sendUpgradeRequest(ecs: ECS) {
	if (ecs.getEventReader(RequestUpgradeEvent).empty()) return;

	ecs.getEventReader(RequestUpgradeEvent)
		.get()
		.forEach((event) => {
			const socket = getSocket(ecs, 'game');

			const [{ pid }] = ecs.query([Player]).single();

			const update = stitch(encodeString(pid), encodeString(event.tool));

			socket.send('upgrade-request', update);
		});
}

function setTool(ecs: ECS) {
	if (ecs.query([Flags], With(Player)).empty()) return;
	const [flags] = ecs.query([Flags], With(Player)).single();
	const { selectedTool } = ecs.getResource(UIData);

	flags.selectedTool = get(selectedTool);
}

function updateInventory(ecs: ECS) {
	if (ecs.query([Player]).empty()) return;
	const [inv, flags] = ecs.query([Inventory, Flags], With(Player)).single();
	const { wood, stone, food, gold } = ecs.getResource(UIData);

	wood.set(inv.wood);
	stone.set(inv.stone);
	food.set(inv.food);
	gold.set(inv.gold);
}

export function UIPlugin(ecs: ECS) {
	ecs.addMainSystem(updateInventory)
		.addMainSystems(setTool, sendUpgradeRequest)
		.addEventType(RequestUpgradeEvent);
}

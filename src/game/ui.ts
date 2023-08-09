import { ECS, Resource, With } from 'raxis';
import type { Writable } from 'svelte/store';
import { Player } from './player';
import { Inventory } from './inventory';

export class UIData extends Resource {
	constructor(
		public tools: Writable<ToolList>,
		public selectedTool: Writable<0 | 1 | 2 | 3>,
		public wood: Writable<number>,
		public stone: Writable<number>,
		public food: Writable<number>,
		public gold: Writable<number>
	) {
		super();
	}
}

function updateInventory(ecs: ECS) {
	if (ecs.query([Player]).empty()) return;
	const [inv] = ecs.query([Inventory], With(Player)).single();
	const { wood, stone, food, gold } = ecs.getResource(UIData);

	wood.set(inv.wood);
	stone.set(inv.stone);
	food.set(inv.food);
	gold.set(inv.gold);
}

export function UIPlugin(ecs: ECS) {
	ecs.addMainSystem(updateInventory);
}

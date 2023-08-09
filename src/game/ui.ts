import { ECS, Resource, With } from 'raxis';
import { get, type Writable } from 'svelte/store';
import { Player } from './player';
import { Inventory } from './inventory';
import type { ToolList, ToolTier } from './tools';
import { Flags } from './flags';

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

function setTool(ecs: ECS) {
	if (ecs.query([Flags], With(Player)).empty()) return;
	const [flags] = ecs.query([Flags], With(Player)).single();
	const { selectedTool } = ecs.getResource(UIData);

	const tool = get(selectedTool);

	flags.selectedTool =
		tool === 0
			? 'wood'
			: tool === 1
			? 'stone'
			: tool === 2
			? 'melee'
			: 'projectile';
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
	ecs.addMainSystem(updateInventory).addMainSystem(setTool);
}

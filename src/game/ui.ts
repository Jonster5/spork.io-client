import { ECS, ECSEvent, Resource, With } from 'raxis';
import { get, type Writable } from 'svelte/store';
import { BlockHighlight, Player } from './player';
import { Inventory } from './inventory';
import { Tools, type ToolList, type ToolTier, type ToolType } from './tools';
import { Flags } from './flags';
import { Assets, Handle, Sprite, encodeString, getSocket, gotoImageFrame, stitch } from 'raxis-plugins';
import { blockTypeToNumber, type BlockType } from './loadchunks';
import { blockAssets } from './assets';

export class UIData extends Resource {
	constructor(
		public tools: Writable<ToolList>,
		public selectedTool: Writable<ToolType>,
		public selectedBlock: Writable<'none' | BlockType>,
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

	flags.selectedTool = get(selectedTool);
}

function setBlock(ecs: ECS) {
	if (ecs.query([Flags], With(Player)).empty()) return;
	const [flags] = ecs.query([Flags], With(Player)).single();
	const { selectedBlock } = ecs.getResource(UIData);
	const [bd] = ecs.query([Sprite], With(BlockHighlight)).single();
	const assets = ecs.getResource(Assets);

	const name = get(selectedBlock);

	flags.selectedBlock = name;

	if (name === 'none') {
		bd.visible = false;
	} else {
		bd.visible = true;
		bd.material = assets.blocks[name];
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

function updateToolList(ecs: ECS) {
	if (ecs.query([Player]).empty()) return;
	const { tools } = ecs.getResource(UIData);
	const [{ wood, stone, melee, projectile }] = ecs.query([Tools], With(Player)).single();

	tools.set([wood, stone, melee, projectile]);
}

export function UIPlugin(ecs: ECS) {
	ecs.addMainSystems(updateInventory, setTool, setBlock, updateToolList);
}

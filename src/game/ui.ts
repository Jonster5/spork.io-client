import { ECS, Resource } from 'raxis';
import type { Writable } from 'svelte/store';

export class UIData extends Resource {
	constructor(
		public tools: Writable<ToolList>,
		public selectedTool: Writable<0 | 1 | 2 | 3>
	) {
		super();
	}
}

export type ToolTier = 0 | 1 | 2 | 3;
export type ToolList = [ToolTier, ToolTier, ToolTier, ToolTier];

export function UIPlugin(ecs: ECS) {}

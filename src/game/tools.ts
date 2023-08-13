import { Component, ECS, ECSEvent } from 'raxis';

export class ToolDisplay extends Component {}

export class UsingToolEvent extends ECSEvent {
	constructor(public currentTool: number, public tier: number) {
		super();
	}
}

export type ToolType = 'wood' | 'stone' | 'melee' | 'projectile';
export type ToolTier = 0 | 1 | 2 | 3;
export type ToolList = [ToolTier, ToolTier, ToolTier, ToolTier];

export class Tools extends Component {
	wood: ToolTier = 0;
	stone: ToolTier = 0;
	melee: ToolTier = 0;
	projectile: ToolTier = 0;

	serialize(): ArrayBufferLike {
		return new Uint8Array([
			this.wood,
			this.stone,
			this.melee,
			this.projectile,
		]).buffer;
	}

	static deserialize(buffer: ArrayBufferLike): Component {
		const data = new Uint8Array(buffer);
		const tools = new Tools();
		tools.wood = data[0] as ToolTier;
		tools.stone = data[1] as ToolTier;
		tools.melee = data[2] as ToolTier;
		tools.projectile = data[3] as ToolTier;

		return tools;
	}
}

export function ToolsPlugin(ecs: ECS) {
	ecs.addComponentTypes(Tools, ToolDisplay);
}

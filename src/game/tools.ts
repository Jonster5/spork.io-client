import { Component, ECS, ECSEvent } from 'raxis';

export class ToolDisplay extends Component {}

export class UsingToolEvent extends ECSEvent {
	constructor(public currentTool: number, public tier: number) {
		super();
	}
}

export type ToolTier = 0 | 1 | 2 | 3;
export type ToolList = [ToolTier, ToolTier, ToolTier, ToolTier];

export class Tools extends Component {
	wood: ToolTier = 0;
	stone: ToolTier = 0;
	melee: ToolTier = 0;
	projectile: ToolTier = 0;

	selected: 'wood' | 'stone' | 'melee' | 'projectile' = 'wood';

	serialize(): ArrayBufferLike {
		return new Uint8Array([
			this.wood,
			this.stone,
			this.melee,
			this.projectile,
			this.selected === 'wood'
				? 0
				: this.selected === 'stone'
				? 1
				: this.selected === 'melee'
				? 2
				: 3,
		]).buffer;
	}

	static deserialize(buffer: ArrayBufferLike): Component {
		const data = new Uint8Array(buffer);
		const tools = new Tools();
		tools.wood = data[0] as ToolTier;
		tools.stone = data[1] as ToolTier;
		tools.melee = data[2] as ToolTier;
		tools.projectile = data[3] as ToolTier;

		tools.selected =
			data[4] === 0
				? 'wood'
				: data[4] === 1
				? 'stone'
				: data[4] === 2
				? 'melee'
				: 'projectile';

		return tools;
	}
}

export function ToolsPlugin(ecs: ECS) {
	ecs.addComponentTypes(Tools, ToolDisplay);
}

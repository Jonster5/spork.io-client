import { Component, ECS } from 'raxis';

export class Tools extends Component {
	gathering: number = 0;
	melee: number = 0;
	projectile: number = 0;

	serialize(): ArrayBufferLike {
		return new Uint8Array([this.gathering, this.melee, this.projectile])
			.buffer;
	}

	static deserialize(buffer: ArrayBufferLike): Component {
		const data = new Uint8Array(buffer);
		const tools = new Tools();
		tools.gathering = data[0];
		tools.melee = data[1];
		tools.projectile = data[2];

		return tools;
	}
}

export function ToolsPlugin(ecs: ECS) {
	ecs.addComponentType(Tools);
}

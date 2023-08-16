import { Component, type ECS } from 'raxis';

export class Health extends Component {
	constructor(public value: number) {
		super();
	}

	serialize(): ArrayBufferLike {
		return new Uint8Array([this.value]).buffer;
	}

	static deserialize(buffer: ArrayBufferLike): Component {
		return new Health(new Uint8Array(buffer)[0]);
	}
}

export function HealthPlugin(ecs: ECS) {
	ecs.addComponentType(Health);
}

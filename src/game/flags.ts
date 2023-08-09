import { Component, ECS, With } from 'raxis';
import type { ToolType } from './tools';
import {
	Inputs,
	decodeString,
	encodeString,
	stitch,
	unstitch,
} from 'raxis-plugins';
import { Player } from './player';

export class Flags extends Component {
	constructor(public isClicking: boolean, public selectedTool: ToolType) {
		super();
	}

	serialize(): ArrayBufferLike {
		return stitch(
			new Uint8Array([this.isClicking ? 1 : 0]).buffer,
			encodeString(this.selectedTool)
		);
	}

	static deserialize(buffer: ArrayBufferLike): Component {
		const data = unstitch(buffer);
		const isClicking = new DataView(data[0]).getUint8(0) === 0;
		const selectedTool = decodeString(data[1]) as ToolType;

		return new Flags(isClicking, selectedTool);
	}
}

function setPointerFlag(ecs: ECS) {
	if (ecs.query([Flags], With(Player)).empty()) return;
	const { pointer } = ecs.getResource(Inputs);

	const [flags] = ecs.query([Flags], With(Player)).single();

	flags.isClicking = pointer.isDown;
}

export function FlagsPlugin(ecs: ECS) {
	ecs.addComponentType(Flags).addMainSystem(setPointerFlag);
}

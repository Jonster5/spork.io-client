import { Component, ECS, With } from 'raxis';
import type { ToolTier, ToolType } from './tools';
import { Inputs, decodeString, encodeString, stitch, unstitch } from 'raxis-plugins';
import { Player } from './player';
import type { BlockType } from './loadchunks';

export class Flags extends Component {
	constructor(public isClicking: boolean, public selectedTool: ToolType, public selectedBlock: 'none' | BlockType) {
		super();
	}

	serialize(): ArrayBufferLike {
		return stitch(
			new Uint8Array([this.isClicking ? 1 : 0]).buffer,
			encodeString(this.selectedTool),
			encodeString(this.selectedBlock)
		);
	}

	static deserialize(buffer: ArrayBufferLike): InstanceType<typeof this> {
		const data = unstitch(buffer);
		const isClicking = new Uint8Array(data[0])[0] === 0;
		const selectedTool = decodeString(data[1]) as ToolType;
		const selectedBlock = decodeString(data[2]) as BlockType;

		return new Flags(isClicking, selectedTool, selectedBlock);
	}
}

function setPointerFlag(ecs: ECS) {
	if (ecs.query([Flags], With(Player)).empty()) return;
	const { pointer } = ecs.getResource(Inputs);

	const [flags] = ecs.query([Flags], With(Player)).results();

	for (let flag of flags) {
		flag.isClicking = pointer.isDown;
	}
}

export function FlagsPlugin(ecs: ECS) {
	ecs.addComponentType(Flags).addMainSystem(setPointerFlag);
}

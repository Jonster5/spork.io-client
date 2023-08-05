import { Component, ECS } from 'raxis';

export class Inventory extends Component {
	wood: number = 0;
	stone: number = 0;
	food: number = 0;

	gold: number = 0;

	// serialize(): ArrayBufferLike {
	// 	return new Uint16Array([this.wood, this.stone, this.food, this.gold])
	// 		.buffer;
	// }

	static deserialize(buffer: ArrayBufferLike): Component {
		const data = new Uint16Array(buffer);
		const inventory = new Inventory();

		inventory.wood = data[0];
		inventory.stone = data[1];
		inventory.food = data[2];
		inventory.gold = data[3];

		return inventory;
	}
}

export function InventoryPlugin(ecs: ECS) {
	ecs.addComponentType(Inventory);
}

import { cloneDeep } from 'lodash';
import { Piece } from './piece';

export class RandomPieceGenerator {
	bag = [0, 1, 2, 3, 4, 5, 6];
	index = -1;

	constructor() {
		this.shuffleBag();
	}

	nextPiece() {
		this.index += 1;
		if (this.index >= this.bag.length) {
			this.shuffleBag();
			this.index = 0;
		}
		return Piece.fromIndex(this.bag[this.index]);
	}

	shuffleBag() {
		let currentIndex = this.bag.length,
			temporaryValue,
			randomIndex;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = this.bag[currentIndex];
			this.bag[currentIndex] = this.bag[randomIndex];
			this.bag[randomIndex] = temporaryValue;
		}
	}

	serialize(): [number[], number] {
		return [cloneDeep(this.bag), this.index];
	}

	static deserialize([bag, index]: [number[], number]) {
		const rpg = new RandomPieceGenerator();
		rpg.bag = cloneDeep(bag);
		rpg.index = index;
		return rpg;
	}
}

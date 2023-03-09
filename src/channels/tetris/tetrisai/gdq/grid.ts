import { cloneDeep } from 'lodash';
import { Piece } from './piece';

export class Grid {
	public cells: number[][] = new Array(this.rows);

	constructor(public rows: number, public columns: number) {
		for (let y = 0; y < this.rows; ++y) {
			this.cells[y] = new Array(this.columns);
			for (let x = 0; x < this.columns; ++x) {
				this.cells[y][x] = 0;
			}
		}
	}

	clone() {
		const newGrid = new Grid(this.rows, this.columns);

		for (let y = 0; y < this.rows; ++y) {
			for (let x = 0; x < this.columns; ++x) {
				newGrid.cells[y][x] = this.cells[y][x];
			}
		}

		return newGrid;
	}

	clearLines() {
		let l = this.rows;
		for (let y = 0; y < l; y++) {
			if (this.isLine(y)) {
				this.cells.splice(y, 1);
				y -= 1;
				l -= 1;
			}
		}

		for (let i = 0; i < this.rows - l; ++i) {
			this.cells.unshift(new Array(this.columns).fill(0));
		}

		return this.rows - l;
	}

	isLine(row: number) {
		for (let x = 0; x < this.columns; ++x) {
			if (this.cells[row][x] == 0) return false;
		}
		return true;
	}

	isEmptyRow(row: number) {
		for (let x = 0; x < this.columns; ++x) {
			if (this.cells[row][x] != 0) return false;
		}
		return true;
	}

	exceeded() {
		return !this.isEmptyRow(0) || !this.isEmptyRow(1);
	}

	height() {
		let y = 0;
		for (; y < this.rows && this.isEmptyRow(y); ++y);
		return this.rows - y;
	}

	lines() {
		let count = 0;

		for (let y = 0; y < this.rows; ++y) {
			if (this.isLine(y)) {
				count += 1;
			}
		}

		return count;
	}

	holes() {
		let count = 0;

		for (let x = 0; x < this.columns; ++x) {
			let block = false;

			for (let y = 0; y < this.rows; ++y) {
				if (this.cells[y][x] != 0) block = true;
				else if (this.cells[y][x] == 0 && block) count += 1;
			}
		}

		return count;
	}

	blockades() {
		let count = 0;

		for (let x = 0; x < this.columns; ++x) {
			let hole = false;

			for (let y = this.rows - 1; y >= 0; --y) {
				if (this.cells[y][x] == 0) {
					hole = true;
				} else if (this.cells[y][x] != 0 && hole) {
					count += 1;
				}
			}
		}

		return count;
	}

	aggregateHeight() {
		let total = 0;

		for (let x = 0; x < this.columns; ++x) {
			total += this.columnHeight(x);
		}

		return total;
	}

	bumpiness() {
		let total = 0;

		for (let x = 0; x < this.columns - 1; ++x) {
			total += Math.abs(this.columnHeight(x) - this.columnHeight(x + 1));
		}

		return total;
	}

	columnHeight(column: number) {
		let y = 0;
		for (; y < this.rows && this.cells[y][column] == 0; ++y);
		return this.rows - y;
	}

	addPiece(piece: Piece) {
		for (let y = 0; y < piece.cells.length; y++) {
			for (let x = 0; x < piece.cells[y].length; x++) {
				const _y = piece.row + y;
				const _x = piece.column + x;

				if (piece.cells[y][x] != 0 && _y >= 0) {
					this.cells[_y][_x] = piece.cells[y][x];
				}
			}
		}
	}

	valid(piece: Piece) {
		for (let y = 0; y < piece.cells.length; y++) {
			for (let x = 0; x < piece.cells[y].length; x++) {
				const _y = piece.row + y;
				const _x = piece.column + x;

				if (piece.cells[y][x] != 0) {
					if (_y < 0 || _y >= this.rows) {
						return false;
					}
					if (_x < 0 || _x >= this.columns) {
						return false;
					}
					if (this.cells[_y][_x] != 0) {
						return false;
					}
				}
			}
		}

		return true;
	}

	serialize() {
		return cloneDeep(this.cells);
	}

	static deserialize(cells: number[][]) {
		const grid = new Grid(cells.length, cells[0].length);
		grid.cells = cloneDeep(cells);
		return grid;
	}
}

import { cloneDeep } from 'lodash';
import { Grid } from './grid';

export class Piece {
	dimension = this.cells.length;
	row = 0;
	column = 0;
	rotation = 0;

	constructor(public cells: number[][]) {}

	clone() {
		const _cells = new Array(this.dimension);

		for (let y = 0; y < this.dimension; ++y) {
			_cells[y] = new Array(this.dimension);
			for (let x = 0; x < this.dimension; ++x) {
				_cells[y][x] = this.cells[y][x];
			}
		}

		const piece = new Piece(_cells);
		piece.row = this.row;
		piece.column = this.column;
		piece.rotation = this.rotation;
		return piece;
	}

	canMoveLeft(grid: Grid) {
		for (let y = 0; y < this.cells.length; ++y) {
			for (let x = 0; x < this.cells[y].length; ++x) {
				const _y = this.row + y;
				const _x = this.column + x - 1;

				if (this.cells[y][x] != 0) {
					if (!(_x >= 0 && grid.cells[_y][_x] == 0)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	canMoveRight(grid: Grid) {
		for (let y = 0; y < this.cells.length; ++y) {
			for (let x = 0; x < this.cells[y].length; ++x) {
				const _y = this.row + y;
				const _x = this.column + x + 1;

				if (this.cells[y][x] != 0) {
					if (!(_x >= 0 && grid.cells[_y][_x] == 0)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	canMoveDown(grid: Grid) {
		for (let y = 0; y < this.cells.length; ++y) {
			for (let x = 0; x < this.cells[y].length; ++x) {
				const _y = this.row + y + 1;
				const _x = this.column + x;

				if (this.cells[y][x] != 0 && _y >= 0) {
					if (!(_y < grid.rows && grid.cells[_y][_x] == 0)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	moveLeft(grid: Grid) {
		if (!this.canMoveLeft(grid)) {
			return false;
		}
		this.column -= 1;
		return true;
	}

	moveRight(grid: Grid) {
		if (!this.canMoveRight(grid)) {
			return false;
		}
		this.column += 1;
		return true;
	}

	moveDown(grid: Grid) {
		if (!this.canMoveDown(grid)) {
			return false;
		}
		this.row += 1;
		return true;
	}

	rotateCells() {
		this.rotation = (this.rotation + 1) % 4;

		const cells: number[][] = [];

		for (let y = 0, ly = this.cells.length; y < ly; ++y) {
			for (let x = 0, lx = this.cells[y].length; x < lx; ++x) {
				if (!cells[x]) cells[x] = [];
				cells[x][ly - y - 1] = this.cells[y][x];
			}
		}

		this.cells = cells;
	}

	computeRotateOffset(grid: Grid) {
		const _piece = this.clone();
		_piece.rotateCells();

		if (grid.valid(_piece)) {
			return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
		}

		const initialRow = _piece.row;
		const initialCol = _piece.column;

		for (let i = 0; i < _piece.dimension - 1; i++) {
			_piece.column = initialCol + i;
			if (grid.valid(_piece)) {
				return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
			}

			for (let j = 0; j < _piece.dimension - 1; j++) {
				_piece.row = initialRow - j;
				if (grid.valid(_piece)) {
					return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
				}
			}
			_piece.row = initialRow;
		}
		_piece.column = initialCol;

		for (let i = 0; i < _piece.dimension - 1; i++) {
			_piece.column = initialCol - i;
			if (grid.valid(_piece)) {
				return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
			}

			for (let j = 0; j < _piece.dimension - 1; j++) {
				_piece.row = initialRow - j;
				if (grid.valid(_piece)) {
					return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
				}
			}
			_piece.row = initialRow;
		}
		_piece.column = initialCol;

		return null;
	}

	rotate(grid: Grid) {
		const offset = this.computeRotateOffset(grid);

		if (offset != null) {
			this.rotateCells();
			this.row += offset.rowOffset;
			this.column += offset.columnOffset;
		}
	}

	static fromIndex(idx: number) {
		let newPiece: Piece;

		switch (idx) {
			case 0: // O
				newPiece = new Piece([
					[2, 2],
					[2, 2],
				]);
				break;
			case 1: // J
				newPiece = new Piece([
					[5, 0, 0],
					[5, 5, 5],
					[0, 0, 0],
				]);
				break;
			case 2: // L
				newPiece = new Piece([
					[0, 0, 1],
					[1, 1, 1],
					[0, 0, 0],
				]);
				break;
			case 3: // Z
				newPiece = new Piece([
					[3, 3, 0],
					[0, 3, 3],
					[0, 0, 0],
				]);
				break;
			case 4: // S
				newPiece = new Piece([
					[0, 6, 6],
					[6, 6, 0],
					[0, 0, 0],
				]);
				break;
			case 5: // T
				newPiece = new Piece([
					[0, 4, 0],
					[4, 4, 4],
					[0, 0, 0],
				]);
				break;
			case 6: // I
			default:
				newPiece = new Piece([
					[0, 0, 0, 0],
					[7, 7, 7, 7],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
				]);
				break;
		}

		newPiece.row = 0;
		newPiece.column = Math.floor((10 - newPiece.dimension) / 2);
		return newPiece;
	}

	serialize() {
		return cloneDeep(this.cells);
	}

	static deserialize(cells: number[][]) {
		return new Piece(cloneDeep(cells));
	}
}

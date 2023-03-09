import { AI } from './ai';
import { Grid } from './grid';
import { Piece } from './piece';
import { RandomPieceGenerator } from './random_piece_generator';

export type SerializedGameManager = ReturnType<InstanceType<typeof GameManager>['serialize']>;

export class GameManager {
	grid = new Grid(20, 10);
	rpg = new RandomPieceGenerator();
	ai = new AI({
		heightWeight: 0.510066,
		linesWeight: 0.760666,
		holesWeight: 0.35663,
		bumpinessWeight: 0.184483,
	});

	score = 0;
	workingPieces: Piece[] = [];
	workingPiece: Piece | null = null;

	moveTimer: ReturnType<typeof setInterval> | null = null;
	gravityTimer: ReturnType<typeof setInterval> | null = null;

	endTurnCb: (() => void) | undefined;

	addPiece() {
		this.workingPieces.push(this.rpg.nextPiece());
		this.startTurn();
	}

	stop() {
		clearInterval(this.gravityTimer!);
		clearInterval(this.moveTimer!);
		this.gravityTimer = null;
		this.moveTimer = null;
	}

	startTurn() {
		if ((!this.workingPiece && this.workingPieces.length == 0) || this.gravityTimer) return;

		if (!this.workingPiece) this.workingPiece = this.workingPieces.splice(0, 1)[0];
		const goalPiece = this.ai.best(this.grid, [this.workingPiece]);

		let softDrop = 0;
		this.moveTimer = setInterval(() => {
			if (!this.workingPiece || !goalPiece.piece) return;

			if (this.workingPiece.rotation !== goalPiece.piece.rotation) {
				this.workingPiece.rotate(this.grid);
				return;
			}

			if (this.workingPiece.column !== goalPiece.piece.column) {
				if (this.workingPiece.column < goalPiece.piece.column) this.workingPiece.moveRight(this.grid);
				else this.workingPiece.moveLeft(this.grid);

				return;
			}

			if (softDrop == 0 || softDrop > 3) this.workingPiece.moveDown(this.grid);
			if (softDrop > 4) this.workingPiece.moveDown(this.grid);
			softDrop += 0.5;
		}, 1000 / 25);

		let moveDownAttempts = 0;
		this.gravityTimer = setInterval(() => {
			const move = this.workingPiece!.moveDown(this.grid);
			if (!move) moveDownAttempts += 1;
			else moveDownAttempts = 0;

			if (moveDownAttempts == 4) {
				if (!this.endTurn()) {
					this.grid = new Grid(20, 10);
					this.score = 0;
				}

				this.startTurn();
				this.endTurnCb?.();
			}
		}, 1000 / 8);
	}

	endTurn() {
		this.stop();

		this.grid.addPiece(this.workingPiece!);
		this.workingPiece = null;
		this.score += this.grid.clearLines();

		return !this.grid.exceeded();
	}

	serialize() {
		return {
			grid: this.grid.serialize(),
			rpg: this.rpg.serialize(),
			workingPieces: this.workingPieces.map((piece) => piece.serialize()),
			workingPiece: this.workingPiece?.serialize(),
		};
	}

	static deserialize({
		grid,
		rpg,
		workingPieces,
		workingPiece,
	}: {
		grid: number[][];
		rpg: [number[], number];
		workingPieces: number[][][];
		workingPiece: number[][] | undefined;
	}) {
		const manager = new GameManager();
		manager.grid = Grid.deserialize(grid);
		manager.rpg = RandomPieceGenerator.deserialize(rpg);
		manager.workingPieces = workingPieces.map((piece) => Piece.deserialize(piece));
		manager.workingPiece = workingPiece ? Piece.deserialize(workingPiece) : null;
		return manager;
	}
}

export interface VectorBallState {
  size(): number;
  push_back(_0: BallState): void;
  resize(_0: number, _1: BallState): void;
  set(_0: number, _1: BallState): boolean;
  get(_0: number): any;
  delete(): void;
}

export type vector3 = [ number, number, number ];

export type BallState = {
  position: vector3,
  prevPosition: vector3,
  direction: vector3,
  speed: number,
  RayMaxDistance: number,
  timeDelta: number,
  active: boolean
};

export type TableState = {
  score: number,
  scoreE9Part: number,
  scoreMultiplier: number,
  scoreAdded: number,
  jackpotScore: number,
  jackpotScoreFlag: boolean,
  bonusScore: number,
  bonusScoreFlag: boolean,
  reflexShotScore: number,
  extraBalls: number,
  ballCount: number,
  ballLockedCounter: number,
  ballList: any,
  replayActiveFlag: boolean
};

export interface MainModule {
  VectorBallState: {new(): VectorBallState};
  sendBall(): void;
  pause(_0: boolean): void;
  toggleLeftFlipper(_0: boolean): void;
  toggleRightFlipper(_0: boolean): void;
  ballCount(): number;
  getScore(): number;
  addBall(_0: number, _1: number): boolean;
  Serialize(): TableState;
  Deserialize(_0: TableState): void;
}

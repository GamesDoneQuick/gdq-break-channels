import * as PIXI from 'pixi.js'

export const getDistanceBetweenPositions = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    const xDist = Math.abs(a.x - b.x)
    const yDist = Math.abs(a.y - b.y)
    return (xDist + yDist) / 2.0
}


/** https://github.com/pixijs/pixijs/blob/ee65355a7e93f51199e19ecd27157679d7b04bd8/src/math-extras/pointExtras.ts#L212 */
export const normalizePoint = <T extends PIXI.IPointData>(point: T): PIXI.Point => {
    const magnitude = Math.sqrt((point.x * point.x) + (point.y * point.y));

    const x = point.x / magnitude;
    const y = point.y / magnitude;

    return new PIXI.Point(x, y);
}
import grandmaBackground from './assets/bgGrandma.png';
import farmBackground from './assets/bgFarm.png';
import mineBackground from './assets/bgMine.png';
import factoryBackground from './assets/bgFactory.png'
import bankBackground from './assets/bgBank.png'
import templeBackground from './assets/bgTemple.png'
import towerBackground from './assets/bgTower.png'
import shipmentBackground from './assets/bgShipment.png'
import labBackground from './assets/bgLab.png'
import portalBackground from './assets/bgPortal.png'
import timeBackground from './assets/bgTime.png'
import antimBackground from './assets/bgAntim.png'
import prismBackground from './assets/bgPrism.png'
import { RefObject } from 'react';

export type Building = {
    index: number; // gives location of building on sprite sheets 
    name: string;
    total: number;
    price: number;
    background: string;
    canvasRef: null | RefObject<HTMLCanvasElement>;
    savedCanvas: undefined | ImageData;
    storeRef: null | RefObject<HTMLDivElement>;
    yRandomization: number;
}

// let cursor: Building = {
//     index: 0,
//     name: "Cursor",
//     total: 0,
//     price: 1,
//     background: "",
//     canvasRef: null,
//     savedCanvas: null,
//     storeRef: null,
//     yRandomization: 0,
// }

let grandma: Building = {
    index: 1,
    name: "Grandma",
    total: 0,
    price: 1,
    background: grandmaBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 10,
}

let farm: Building = {
    index: 2,
    name: "Farm",
    total: 0,
    price: 5,
    background: farmBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 8,
}

let mine: Building = {
    index: 3,
    name: "Mine",
    total: 0,
    price: 10,
    background: mineBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 8,
}

let factory: Building = {
    index: 4,
    name: "Factory",
    total: 0,
    price: 15,
    background: factoryBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 0,
}

let bank: Building = {
    index: 5,
    name: "Bank",
    total: 0,
    price: 30,
    background: bankBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 4,
}

let temple: Building = {
    index: 6,
    name: "Temple",
    total: 0,
    price: 50,
    background: templeBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 2,
}

let tower: Building = {
    index: 7,
    name: "Wizard Tower",
    total: 0,
    price: 75,
    background: towerBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 5,
}

let shipment: Building = {
    index: 8,
    name: "Shipment",
    total: 0,
    price: 100,
    background: shipmentBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 3,
}

let lab: Building = {
    index: 9,
    name: "Alchemy Lab",
    total: 0,
    price: 125,
    background: labBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 4,
}

let portal: Building = {
    index: 10,
    name: "Portal",
    total: 0,
    price: 150,
    background: portalBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 4,
}

let timeMachine: Building = {
    index: 11,
    name: "Time Machine",
    total: 0,
    price: 175,
    background: timeBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 5,
}

let antimCondenser: Building = {
    index: 12,
    name: "Antimatter",
    total: 0,
    price: 200,
    background: antimBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 8,
}

let prism: Building = {
    index: 13,
    name: "Prism",
    total: 0,
    price: 250,
    background: prismBackground,
    canvasRef: null,
    savedCanvas: undefined,
    storeRef: null,
    yRandomization: 1,
}

export let buildings = [grandma, farm, mine, factory, bank, temple, tower, shipment, lab, portal, timeMachine, antimCondenser, prism];
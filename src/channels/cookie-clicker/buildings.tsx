export type Building = {
    id: number;
    name: string;
    total: number;
    price: number;
    background: string;
    canvasRef: any;
    savedCanvas: any;
    storeRef: any;
    yRandomization: number;
}

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

// export let cursor: Building = {
//     id: 0,
//     name: "Cursor",
//     total: 0,
//     price: 1,
//     background: "",
//     canvasRef: null,
//     savedCanvas: null,
//     storeRef: null,
//     yRandomization: 0,
// }

export let grandma: Building = {
    id: 1,
    name: "Grandma",
    total: 0,
    price: 1,
    background: grandmaBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 10,
}

export let farm: Building = {
    id: 2,
    name: "Farm",
    total: 0,
    price: 5,
    background: farmBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 8,
}

export let mine: Building = {
    id: 3,
    name: "Mine",
    total: 0,
    price: 10,
    background: mineBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 8,
}

export let factory: Building = {
    id: 4,
    name: "Factory",
    total: 0,
    price: 15,
    background: factoryBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 0,
}

export let bank: Building = {
    id: 5,
    name: "Bank",
    total: 0,
    price: 30,
    background: bankBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 4,
}

export let temple: Building = {
    id: 6,
    name: "Temple",
    total: 0,
    price: 50,
    background: templeBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 2,
}

export let tower: Building = {
    id: 7,
    name: "Wizard Tower",
    total: 0,
    price: 75,
    background: towerBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 5,
}

export let shipment: Building = {
    id: 8,
    name: "Shipment",
    total: 0,
    price: 100,
    background: shipmentBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 3,
}

export let lab: Building = {
    id: 9,
    name: "Alchemy Lab",
    total: 0,
    price: 125,
    background: labBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 4,
}

export let portal: Building = {
    id: 10,
    name: "Portal",
    total: 0,
    price: 150,
    background: portalBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 4,
}

export let timeMachine: Building = {
    id: 11,
    name: "Time Machine",
    total: 0,
    price: 175,
    background: timeBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 5,
}

export let antimCondenser: Building = {
    id: 12,
    name: "Antimatter",
    total: 0,
    price: 200,
    background: antimBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 8,
}

export let prism: Building = {
    id: 13,
    name: "Prism",
    total: 0,
    price: 250,
    background: prismBackground,
    canvasRef: null,
    savedCanvas: null,
    storeRef: null,
    yRandomization: 1,
}
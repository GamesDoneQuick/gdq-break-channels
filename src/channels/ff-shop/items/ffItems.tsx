import { ShopItem } from '../shopItems';
import sword from '../assets/items/sword.png';
import spear from '../assets/items/spear.png';
import staff from '../assets/items/staff.png';
import item from '../assets/items/item.png';
import materiaMagic from '../assets/items/materia-magic.png';
import materiaSummon from '../assets/items/materia-summon.png';
import materiaSupport from '../assets/items/materia-support.png';

export const FFItems: Record<string, ShopItem> = {
	busterSword: {
		id: 'busterSword',
		name: 'Buster Sword',
		description:
			'An oversized weapon with two Materia slots. Wielding this could make you look either cool or edgy.',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	theRevolver: {
		id: 'theRevolver',
		name: 'The Revolver',
		description:
			'A large gunblade with a rotating revolver barrel. Its damage output increases after firing bullets.',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	engineBlade: {
		id: 'engineBlade',
		name: 'Engine Blade',
		description:
			'A regal sword that can absorb elemental powers. If thrown, the user can wrong-warp to its new location.',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	masamune: {
		id: 'masamune',
		name: 'Masamune',
		description: 'An impossibly long odachi blade. You hear chanting whenever you touch it. ~Veni, veni, venias.~',
		series: 'finalFantasy',
		donationTypeRequired: 'big',
		sprite: sword,
	},
	dragoonLance: {
		id: 'dragoonLance',
		name: 'Dragoon Lance',
		description:
			'This spear represents a strong bond between a human and a dragon. Owning it makes you jump for joy.',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: spear,
	},
	mithrilRod: {
		id: 'mithrilRod',
		name: 'Mithril Rod',
		description: 'A simple, stylish staff made of mithril. Its intricate engraving makes you feel like crying.',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: staff,
	},
	ether: {
		id: 'ether',
		name: 'Ether',
		description: 'Restores a small amount of MP. Its energy hypes you up for the next run!',
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: item,
	},
	phoenixDown: {
		id: 'phoenixDown',
		name: 'Phoenix Down',
		description: `This tuft of fluffy down feathers can revive KO'd friends. Doesn't work for dead runs, though.`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: item,
	},
	moogleCharm: {
		id: 'moogleCharm',
		name: 'Moogle Charm',
		description: `What a cute hand-crafted keepsake, kupo! Maybe it could be yours with a lucky donation!`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: item,
	},
	chocoboFeather: {
		id: 'chocoboFeather',
		name: 'Chocobo Feather',
		description: `This vivid feather radiates joviality and agility. You can't help but whistle a certain catchy tune.`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: item,
	},
	knightsOfTheRound: {
		id: 'knightsOfTheRound',
		name: 'Knights of the Round',
		description: `Summons the extremely powerful Knights of the Round Table. Its animation could kill your run.`,
		series: 'finalFantasy',
		donationTypeRequired: 'big',
		sprite: materiaSummon,
	},
	bahamutZero: {
		id: 'bahamutZero',
		name: 'Bahamut ZERO',
		description: `A hidden and easily-missed Summon Materia. Its devastating Tera Flare is satisfying to watch.`,
		series: 'finalFantasy',
		donationTypeRequired: 'big',
		sprite: materiaSummon,
	},
	hpAbsorb: {
		id: 'hpAbsorb',
		name: 'HP Absorb',
		description: `When using the Materia attached to this one, some HP can be regained.`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: materiaSupport,
	},
	fire: {
		id: 'fire',
		name: 'Fire',
		description: `Just your basic fire magic. Can be found in most games.`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: materiaMagic,
	},
	time: {
		id: 'time',
		name: 'Time',
		description: `Just your basic time magic. Can NOT be found in most games.`,
		series: 'finalFantasy',
		donationTypeRequired: 'small',
		sprite: materiaMagic,
	},
};

export const FFItemList = Object.values(FFItems);

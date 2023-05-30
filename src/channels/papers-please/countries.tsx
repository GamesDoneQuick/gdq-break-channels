export type Country = {
	id: Number;
	person: string;
	passportInner: string;
	passportOuter: string;
	totalTextLocation: {
		left: string;
		top: string;
	};
	supplementTextLocation: any;
};

import passportInnerAntegria from './assets/PassportInnerAntegria.png';
import passportOuterAntegria from './assets/PassportOuterAntegria.png';
import personAntegria from './assets/PersonAntegria.png';
import passportInnerArstotzka from './assets/PassportInnerArstotzka.png';
import passportOuterArstotzka from './assets/PassportOuterArstotzka.png';
import personArstotzka from './assets/PersonArstotzka.png';
import passportInnerImpor from './assets/PassportInnerImpor.png';
import passportOuterImpor from './assets/PassportOuterImpor.png';
import personImpor from './assets/PersonImpor.png';
import passportInnerKolechia from './assets/PassportInnerKolechia.png';
import passportOuterKolechia from './assets/PassportOuterKolechia.png';
import personKolechia from './assets/PersonKolechia.png';
import passportInnerObristan from './assets/PassportInnerObristan.png';
import passportOuterObristan from './assets/PassportOuterObristan.png';
import personObristan from './assets/PersonObristan.png';
import passportInnerRepublia from './assets/PassportInnerRepublia.png';
import passportOuterRepublia from './assets/PassportOuterRepublia.png';
import personRepublia from './assets/PersonRepublia.png';
import passportInnerUnitedFed from './assets/PassportInnerUnitedFed.png';
import passportOuterUnitedFed from './assets/PassportOuterUnitedFed.png';
import personUnitedFed from './assets/PersonUnitedFed.png';

export const countries: Country[] = [
	{
		id: 0,
		person: personAntegria,
		passportInner: passportInnerAntegria,
		passportOuter: passportOuterAntegria,
		totalTextLocation: {
			left: '30px',
			top: '482px',
		},
		supplementTextLocation: {
			left: '90px',
			top: '353px',
			lineHeight: '32px',
			fontSize: '38px',
		},
	},
	{
		id: 1,
		person: personArstotzka,
		passportInner: passportInnerArstotzka,
		passportOuter: passportOuterArstotzka,
		totalTextLocation: {
			left: '30px',
			top: '306px',
		},
		supplementTextLocation: {
			left: '238px',
			top: '346px',
			lineHeight: '28px',
			fontSize: '38px',
		},
	},
	{
		id: 2,
		person: personImpor,
		passportInner: passportInnerImpor,
		passportOuter: passportOuterImpor,
		totalTextLocation: {
			left: '25px',
			top: '300px',
		},
		supplementTextLocation: {
			left: '245px',
			top: '339px',
			lineHeight: '28px',
			fontSize: '38px',
		},
	},
	{
		id: 3,
		person: personKolechia,
		passportInner: passportInnerKolechia,
		passportOuter: passportOuterKolechia,
		totalTextLocation: {
			left: '30px',
			top: '342px',
		},
		supplementTextLocation: {
			left: '243px',
			top: '378px',
			lineHeight: '28px',
			fontSize: '38px',
		},
	},
	{
		id: 4,
		person: personObristan,
		passportInner: passportInnerObristan,
		passportOuter: passportOuterObristan,
		totalTextLocation: {
			left: '25px',
			top: '342px',
		},
		supplementTextLocation: {
			left: '91px',
			top: '391px',
			lineHeight: '28px',
			fontSize: '42px',
		},
	},
	{
		id: 5,
		person: personRepublia,
		passportInner: passportInnerRepublia,
		passportOuter: passportOuterRepublia,
		totalTextLocation: {
			left: '29px',
			top: '306px',
		},
		supplementTextLocation: {
			left: '93px',
			top: '347px',
			fontSize: '41px',
			lineHeight: '28px',
		},
	},
	{
		id: 6,
		person: personUnitedFed,
		passportInner: passportInnerUnitedFed,
		passportOuter: passportOuterUnitedFed,
		totalTextLocation: {
			left: '28px',
			top: '340px',
		},
		supplementTextLocation: {
			left: '241px',
			top: '375px',
			fontSize: '41px',
			lineHeight: '28px',
		},
	},
];

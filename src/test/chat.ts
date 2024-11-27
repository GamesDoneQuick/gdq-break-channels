export function generateReaction() {
	
}

export enum ReactionType {
	Aaah,
	Annoyed,
	Blindfold,
	Bow,
	Clap,
	Cry,
	Dance,
	Doctor,
	Dog,
	Exclamation,
	Faith,
	FaithPOP,
	Fast,
	Fistpump,
	Flag,
	Glitch,
	Grin,
	Goose,
	HeartEnbyPride,
	HeartPride,
	HeartTransPride,
	Heart,
	Idle,
	Jump,
	Lamp,
	Laugh,
	Orb,
	Pog,
	Robot,
	Sanic,
	Sing,
	Skeleton,
	Spinball,
	Stressed,
	What,
}

export const EMOTE_REACTIONS: Record<string, ReactionType> = {
	'300463654': ReactionType.Aaah, // gdqAAAH
	'34': ReactionType.Aaah, // SwiftRage

	'300463588': ReactionType.Annoyed, // gdqAnnoyed
	'160401': ReactionType.Annoyed, // PunOko

	'15531': ReactionType.Blindfold, // gdqDanielSan
	emotesv2_5335f269e1334c65ae033dbc9dd7d027: ReactionType.Blindfold, // gdqBlindfold

	'104869': ReactionType.Clap, // gdqClap

	'300463602': ReactionType.Cry, // gdqThump
	'86': ReactionType.Cry, // BibleThump

	emotesv2_d669ef1ee76b4aa3a2d4c1981a41516a: ReactionType.Dance, // gdqDance

	'1127139': ReactionType.Doctor, // gdqHealth
	emotesv2_dff7ed60bb0d4666b6d8ac4c167d463b: ReactionType.Doctor, // gdqMSF

	'65': ReactionType.Dog, // FrankerZ
	'81103': ReactionType.Dog, // OhMyDog

	'15598': ReactionType.Exclamation, // gdqWotHappened
	emotesv2_c309de533c804c3ebd7fc1eaf71f3592: ReactionType.Exclamation, // gdqWHAT

	'300138447': ReactionType.Faith, // gdqFaith

	emotesv2_dbb7730585ac40d3ac351287c08d2553: ReactionType.FaithPOP, // gdqFaithPOP

	'1127144': ReactionType.Fast, // gdqFAST

	'300463646': ReactionType.Fistpump, // gdqCheer

	'104868': ReactionType.Flag, // gdqTime
	emotesv2_25fd3d03a80a47bfbda2cc21729f56e2: ReactionType.Flag, // gdqTimer
	emotesv2_b5dccea360284bab897d04a99197dcf2: ReactionType.Flag, // gdqTimer

	'690456': ReactionType.Glitch, // gdqVAC
	'1127140': ReactionType.Glitch, // gdqOOB

	'300463598': ReactionType.Grin, // gdqHappy

	'425618': ReactionType.Laugh, // LUL

	'34421': ReactionType.Heart, // gdqAnimals
	'1127135': ReactionType.Heart, // gdqHeart
	'62835': ReactionType.Heart, // bleedPurple

	'303241146': ReactionType.HeartEnbyPride, // gdqNBPride

	'300922362': ReactionType.HeartPride, // gdqPride

	'300922395': ReactionType.HeartTransPride, // gdqTransPride

	emotesv2_9c2d04d6cb7b472589cbdb0920fe9c9e: ReactionType.Goose, // gdqHonk

	'81273': ReactionType.Pog, // KomodoHype
	'305954156': ReactionType.Pog, // PogChamp

	'303370420': ReactionType.Lamp, // gdqLamp

	'28': ReactionType.Robot, // MrDestructoid
	'1807472': ReactionType.Robot, // gdqRobotBody

	'1786293': ReactionType.Sanic, // gdqSanic

	'1127141': ReactionType.Sing, // gdqSing
	'300116350': ReactionType.Sing, // SingsNote

	'1807542': ReactionType.Skeleton, // gdqRipUrn

	emotesv2_e90948348526481396bff70d2820f973: ReactionType.Spinball, // gdqSpin

	'300463660': ReactionType.Stressed, // gdqS
	'58765': ReactionType.Stressed, // NotLikeThis

	'300463622': ReactionType.What, // gdqWat
	'28087': ReactionType.What, // WutFace

	emotesv2_ca864d68f8b5431e90e527d1babc19a6: ReactionType.Bow, // gdqBow
};

export const MESSAGE_REACTIONS: [RegExp, ReactionType][] = [
	[/\bPogChamp\b/, ReactionType.Fistpump],
	[/\bSourPls\b/, ReactionType.Sing],
	[/\bo+r+b+\b/i, ReactionType.Orb],
	[/\bh+o+n+k+\b/i, ReactionType.Goose],
];

export const WAVE_MESSAGE_PATTERN = /\bwave\b/i;
export const WAVE_BADGE_PATTERN = /broadcaster|moderator/i;

export type ReactionState = Record<string, number>;
export type ReactionCallback = (value: ReactionState, states: Array<ReactionState>) => void;
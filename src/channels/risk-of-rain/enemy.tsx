import { FC, useEffect, useRef } from "react";
import styled from '@emotion/styled';

import { calculateHPFromDonation } from "./utilities";

export type EnemyData = { color: string; image: string };
export type EnemyElementProps = {
	key: number;
	id: string;
	donationValue: number;
	spawnedAt: number;
	enemyData: EnemyData;
};

export const EnemyView: FC<EnemyElementProps> = ({ enemyData, donationValue }) => {
	let spawnedAt = Number.MAX_SAFE_INTEGER;
	let enemyScroll = -66;

	const { color, image } = enemyData;
	const hp = calculateHPFromDonation(donationValue);

	let enemyRef = useRef<HTMLDivElement>(null);
	let enemySumRef = useRef<HTMLDivElement>(null);
	let enemyHpBarFillRef = useRef<HTMLDivElement>(null);
	const donationValueWithTwoDecimals = donationValue.toFixed(2);

	useEffect(() => {
		spawnedAt = Date.now();
		const enemyInterval = setInterval(() => {
			enemyScroll += 1;
			if (enemyScroll > 1718) {
				enemyScroll = 0;
			}
			if (enemyRef.current) {
				enemyRef.current.style.right = enemyScroll + 'px';
			}

			if (enemySumRef.current) {
				enemySumRef.current.style.color = color;
			}
			if (enemyHpBarFillRef.current) {
				enemyHpBarFillRef.current.style.width = Math.floor((1 - (Date.now() - spawnedAt) / hp) * 20) * 5 + '%';
			}
		}, 10);
		return () => clearInterval(enemyInterval);
	}, []);

	const Enemy = styled.div`
		position: absolute;
		bottom: 0;
		right: -100px;

		width: 66px;
		height: 66px;
		transform: scaleX(-1);
		background-image: url('${image}');
	`;

	const EnemyHpBar = styled.div`
		display: block;
		width: 84px;
		height: 8px;
		margin-left: -10px;
		margin-top: -10px;
		background: black;
		border: 2px solid #404157;
		position: relative;
	`;

	const EnemyHpBarFill = styled.div`
		position: absolute;
		display: block;
		width: 100%;
		height: 100%;
		background: #c7352f;
		right: 0;
	`;

	const EnemySum = styled.div`
		color: #c0c0c0;
		font-size: 16px;
		font-family: gdqpixel;
		margin-left: -100%;
		margin-right: -100%;
		transform: scaleX(-1);
		text-align: center;
		margin-top: -50px;
		padding-bottom: 20px;
		text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 1px 2px 0 #000;
	`;

	return (
		<Enemy ref={enemyRef}>
			<EnemySum ref={enemySumRef}>${donationValueWithTwoDecimals}</EnemySum>
			<EnemyHpBar>
				<EnemyHpBarFill ref={enemyHpBarFillRef}></EnemyHpBarFill>
			</EnemyHpBar>
		</Enemy>
	);
};
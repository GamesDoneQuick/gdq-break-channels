import React from 'react';

interface Props {
	newSubscriber: string;
	donationTotal: string;
	progress: number;
	eventTitle: string;
}

export const InstallerBackground = (props: Props) => {
	const { progress } = props;

	const progressBarStartPosition = 91.15;
	const progressBarFullPosition = 196.639;
	const progressBarCurrentPosition =
		progressBarStartPosition + (progressBarFullPosition - progressBarStartPosition) * progress;

	const maskBarStartPosition = 483.071;
	const maskBarFullPosition = 1102.656;
	const maskBarCurrentPosition = maskBarStartPosition + (maskBarFullPosition - progressBarStartPosition) * progress;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1092"
			height="332"
			version="1.1"
			viewBox="0 0 288.925 87.842"
			xmlSpace="preserve">
			<defs>
				<clipPath id="clippy" clipPathUnits="userSpaceOnUse">
					<path
						fill="navy"
						fillOpacity="1"
						stroke="none"
						strokeDasharray="4.6796, 4.6796"
						strokeDashoffset="0"
						strokeOpacity="1"
						strokeWidth="4.68"
						d={`M87.581 51.698H${progressBarCurrentPosition}V57.878H87.581z`}></path>
				</clipPath>
			</defs>
			<g>
				<path fill="teal" fillOpacity="1" strokeWidth="0.256" d="M0 0H288.925V87.842H0z"></path>
				<text
					fill="#000"
					fillOpacity="1"
					stroke="none"
					display="inline"
					fontFamily="sans-serif"
					fontSize="40"
					fontStyle="normal"
					fontWeight="normal"
					letterSpacing="0"
					transform="matrix(.26458 0 0 .26458 -28.718 -28.592)"
					wordSpacing="0"
					xmlSpace="preserve"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan x="130.807" y="157.153">
						<tspan fontFamily="Times New Roman" fontStyle="italic" fontWeight="bold">
							{props.eventTitle}
						</tspan>
					</tspan>
				</text>
				<text
					fill="#fff"
					fillOpacity="1"
					stroke="none"
					display="inline"
					fontFamily="sans-serif"
					fontSize="40"
					fontStyle="normal"
					fontWeight="normal"
					letterSpacing="0"
					transform="matrix(.26458 0 0 .26458 -29.776 -29.65)"
					wordSpacing="0"
					xmlSpace="preserve"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan x="130.807" y="157.153">
						<tspan style={{}} fontFamily="Times New Roman" fontStyle="italic" fontWeight="bold">
							{props.eventTitle}
						</tspan>
					</tspan>
				</text>
				<path
					fill="#d4d0c8"
					fillOpacity="1"
					strokeWidth="0.216"
					d="M84.218 37.37H199.361V73.666H84.218z"></path>
				<path
					fill="none"
					stroke="#000"
					strokeDasharray="none"
					strokeOpacity="1"
					strokeWidth="0.5"
					d="M199.208 37.369v36.144H84.184"></path>
				<path
					fill="none"
					fillOpacity="1"
					stroke="#888"
					strokeDasharray="none"
					strokeOpacity="1"
					strokeWidth="0.25"
					d="M199.077 37.369v35.97H84.195"></path>
				<path
					fill="none"
					fillOpacity="1"
					stroke="#fdfdfd"
					strokeDasharray="none"
					strokeOpacity="1"
					strokeWidth="0.25"
					d="M84.537 73.254V37.719h114.415"></path>
				<g transform="translate(.038 -36.785)">
					<path
						fill="#d4d0c8"
						fillOpacity="1"
						strokeWidth="0.047"
						d="M127.198 98.876H153.489V106.35600000000001H127.198z"></path>
					<path
						fill="none"
						stroke="#000"
						strokeDasharray="none"
						strokeOpacity="1"
						strokeWidth="0.5"
						d="M153.453 98.875v7.449H127.19"></path>
					<path
						fill="none"
						fillOpacity="1"
						stroke="#888"
						strokeDasharray="none"
						strokeOpacity="1"
						strokeWidth="0.25"
						d="M153.316 98.875v7.304h-26.124"></path>
					<path
						fill="none"
						fillOpacity="1"
						stroke="#fdfdfd"
						strokeDasharray="none"
						strokeOpacity="1"
						strokeWidth="0.25"
						d="M127.27 106.27v-7.323h26.125"></path>
				</g>
				<path
					fill="#fff"
					fillOpacity="1"
					stroke="none"
					strokeDasharray="none"
					strokeOpacity="1"
					strokeWidth="0.283"
					d="M87.579 51.745H196.639V58.019H87.579z"></path>
				<rect
					width="24.611"
					height="5.994"
					x="128.158"
					y="62.793"
					fill="none"
					fillOpacity="1"
					stroke="#000"
					strokeDasharray="0.256, 0.256"
					strokeDashoffset="0"
					strokeOpacity="1"
					strokeWidth="0.256"
					ry="0"></rect>
				<text
					fill="#000"
					fillOpacity="1"
					stroke="none"
					display="inline"
					fontFamily="sans-serif"
					fontSize="40"
					fontStyle="normal"
					fontWeight="normal"
					letterSpacing="0"
					transform="matrix(.09 0 0 .09 98.978 56.425)"
					wordSpacing="0"
					xmlSpace="preserve"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan x="399.143" y="118.383">
						<tspan fontFamily="Arial">Cancel</tspan>
					</tspan>
				</text>

				<text
					fill="#000"
					fillOpacity="1"
					stroke="none"
					display="inline"
					fontFamily="sans-serif"
					fontSize="40"
					fontStyle="normal"
					fontWeight="normal"
					letterSpacing="0"
					transform="matrix(.09 0 0 .09 51.631 35.015)"
					wordSpacing="0"
					xmlSpace="preserve"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan x="399.143" y="118.383">
						{`c:\\new_subscribers\\${props.newSubscriber}`}
					</tspan>
				</text>
				<text
					fill="#000"
					display="inline"
					fontFamily="sans-serif"
					fontSize="3.8"
					fontStyle="normal"
					fontWeight="normal"
					wordSpacing="0"
					xmlSpace="preserve"
					x="141.5"
					y="56"
					textAnchor="middle"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan>
						<tspan fontFamily="Arial" fontWeight="bold">
							{props.donationTotal}
						</tspan>
					</tspan>
				</text>
				<path
					fill="navy"
					fillOpacity="1"
					stroke="none"
					strokeDasharray="0.108974, 0.108974"
					strokeDashoffset="0"
					strokeOpacity="1"
					strokeWidth="0.109"
					d={`M87.581 51.698H${progressBarCurrentPosition}V57.878H87.581z`}></path>

				<text
					fill="#fff"
					display="inline"
					fontFamily="sans-serif"
					fontSize="3.8"
					fontStyle="normal"
					fontWeight="normal"
					wordSpacing="0"
					xmlSpace="preserve"
					x="141.5"
					y="56"
					textAnchor="middle"
					clipPath="url(#clippy)"
					style={{ lineHeight: '2', whiteSpace: 'pre' }}>
					<tspan>
						<tspan fontFamily="Arial" fontWeight="bold">
							{props.donationTotal}
						</tspan>
					</tspan>
				</text>

				<path
					fill="none"
					stroke="#d4d0c8"
					strokeLinecap="butt"
					strokeLinejoin="miter"
					strokeOpacity="1"
					strokeWidth="0.265"
					d="M196.639 51.745v6.274H87.579"></path>
				<path
					fill="none"
					stroke="#000"
					strokeLinecap="butt"
					strokeLinejoin="miter"
					strokeOpacity="1"
					strokeWidth="0.265"
					d="M87.456 58.155v-6.54h109.32"></path>
				<path
					fill="none"
					stroke="#fff"
					strokeLinecap="butt"
					strokeLinejoin="miter"
					strokeOpacity="1"
					strokeWidth="0.265"
					d="M196.91 51.745v6.535H87.58"></path>
			</g>
		</svg>
	);
};

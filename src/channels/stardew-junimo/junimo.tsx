import styled from '@emotion/styled';
interface JunimoProps {
	image: string;
}

export const Junimo = ({ image }: JunimoProps) => {
	return <JunimoImage src={image} />;
};

const JunimoImage = styled.img`
	width: 150px;
`;

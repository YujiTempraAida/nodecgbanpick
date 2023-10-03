import omnEgao from "../images/OMNegao.png";

type Props = {
	width: number,
	height: number,
	left: string,
	top: string
}

export const OmnEgao = (props: Props) => {
	return (
		<img
			src={omnEgao}
			width={props.width}
			height={props.height}
			style={{
				position:"absolute",
				left: props.left,
				top: props.top
			}}
		></img>
	);
};

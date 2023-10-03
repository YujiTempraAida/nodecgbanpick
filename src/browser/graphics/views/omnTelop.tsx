import "modern-normalize";
import "../styles/adobe-fonts.js";
import {useRef} from "react";
import { Fade } from "@mui/material";
import {OmnEgao} from "../components/omn.js";
import {setup} from "../styles/colors.js";
import {useFitViewport} from "../components/lib/use-fit-viewport.js";
import {render} from "../../render.js";
import { useReplicant } from "../../use-replicant.js";

type Props = {
	width: number,
	height: number,
	left: string,
	top: string
}

const props:Props = {
	width: 320,
	height: 320,
	left: "960px",
	top: "540px"
}


const App = () => {
	const ref = useRef<HTMLDivElement>(null);
	useFitViewport(ref);
	const ikuRep = useReplicant("iku")


	return (
		<div
			ref={ref}
			style={{
				position: "absolute",
				width: "1920px",
				height: "1080px",
				overflow: "hidden",
				color: setup.text,
			}}
		>
			<Fade in={ikuRep?.isIku ?? false}>
				<div>
					<OmnEgao {...props}/>
				</div>
			</Fade>
		</div>
	);
};

render(<App />);

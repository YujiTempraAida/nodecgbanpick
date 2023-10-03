import "modern-normalize";
import "../styles/adobe-fonts.js";
import { BoldText } from "../components/lib/text.js";
import {render} from "../../render.js";
import { useReplicant } from "../../use-replicant.js";

const App = () => {
	const scoreboardRep = useReplicant("scoreboard")

	return (
		<>
			<BoldText style={{fontSize: "64px"}}>
				{"Name: " + scoreboardRep?.name}
			</BoldText>
			<BoldText style={{fontSize: "64px"}}>
				{"Score: " + scoreboardRep?.score}
			</BoldText>
		</>
	);
};

render(<App />);

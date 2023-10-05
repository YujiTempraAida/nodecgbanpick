import "../styles/global";
import {render} from "../../render";
import CssBaseline from "@mui/material/CssBaseline";
import {Banpick} from "../components/banpick";

const App = () => {
	return (
		<>
			<Banpick />
		</>
	);
};

render(
	<>
		<CssBaseline />
		<App />
	</>,
);

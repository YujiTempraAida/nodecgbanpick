import "../styles/global";

import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { Sample } from "../components/scoreboard"; // コンポーネントを参照、ThemeProviderの間にぶち込む
import { render } from "../../render";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme();

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<Sample />
		</ThemeProvider>
	);
};

render(
	<>
		<CssBaseline />
		<App />
	</>,
);

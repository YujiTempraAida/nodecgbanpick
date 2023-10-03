import "../styles/global";

import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { OMNTelop } from "../components/omnTelop"; // コンポーネントを参照、ThemeProviderの間にぶち込む
import { render } from "../../render";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme();

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<OMNTelop />
		</ThemeProvider>
	);
};

render(
	<>
		<CssBaseline />
		<App />
	</>,
);

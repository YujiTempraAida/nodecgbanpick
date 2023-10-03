import {FC, useState} from "react";
import styled from "styled-components";
import {BorderedBox} from "../lib/bordered-box";
// import { useReplicant } from "../../../use-replicant";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import { Scoreboard } from "../../../../nodecg/generated";

const Container = styled(BorderedBox)`
	padding: 16px;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: 1fr;
	grid-gap: 8px;
	user-select: none;
`;


export const Sample: FC = () => {
	const [name, setName] = useState("")
	const [score, setScore] = useState(0)

	const updateScoreboard = (name: string, score: number) => {
		const data: Scoreboard = {name, score}
		nodecg.sendMessage("scoreboard:update", data)
	}


	return (
		<Container>
			<TextField id="name" label="name" variant="outlined" value={name} onChange={(e)=>{setName(e.target.value)}}/>
			<TextField id="score" type="number" label="score" variant="outlined" value={score} onChange={(e)=>{setScore(Number(e.target.value))}}/>
			<Button variant="contained" onClick={() => updateScoreboard(name, score)}>Update</Button>
		</Container>
	);
};

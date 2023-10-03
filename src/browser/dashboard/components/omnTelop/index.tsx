import {FC} from "react";
import styled from "styled-components";
import {BorderedBox} from "../lib/bordered-box";
import { Switch } from "@mui/material";
import { useReplicant } from "../../../use-replicant";
import { BoldText } from "../../../graphics/components/lib/text";

const Container = styled(BorderedBox)`
	padding: 16px;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: 1fr;
	grid-gap: 8px;
	user-select: none;
`;

const ikuRep = nodecg.Replicant("iku")

export const OMNTelop: FC = () => {
	const iku = useReplicant("iku")

	return (
		<Container>
			<Switch
				checked={iku?.isIku}
				onChange={(e) => {
					if(ikuRep.value == undefined) {
						ikuRep.value = {isIku: false}
					}
					ikuRep.value.isIku = e.currentTarget.checked
				}}
			/>
			{ikuRep.value?.isIku ? (<BoldText>"iku"</BoldText>) : (<BoldText>"ikanai"</BoldText>)}
		</Container>
	);
};

import "modern-normalize";
import "../styles/adobe-fonts.js";
import {render} from "../../render.js";
import {useReplicant} from "use-nodecg";
import {Stages} from "../../../nodecg/generated";
import imgPath0 from "../images/0.png";
import imgPath1 from "../images/1.png";
import imgPath2 from "../images/2.png";
import imgPath3 from "../images/3.png";
import imgPath4 from "../images/4.png";
import imgPath5 from "../images/5.png";
import imgPath6 from "../images/6.png";
import {useEffect, useState} from "react";
import {Collapse, List, ListItem} from "@mui/material";
import {TransitionGroup} from "react-transition-group";
// import styled from "styled-components";
import {FontStyles} from "../styles/fontStyles";

const initialValue: Stages = [
	{
		id: 0,
		name: "終点",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath0,
	},
	{
		id: 1,
		name: "戦場",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath1,
	},
	{
		id: 2,
		name: "ポケモンスタジアム2",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath2,
	},
	{
		id: 3,
		name: "ホロウバスティオン",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath3,
	},
	{
		id: 4,
		name: "小戦場",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath4,
	},
	{
		id: 5,
		name: "村と街",
		isStarter: false,
		isChosen: false,
		imgsrc: imgPath5,
	},
	{
		id: 6,
		name: "すま村",
		isStarter: false,
		isChosen: false,
		imgsrc: imgPath6,
	},
];

type PickedStage = {
	chosenOrder?: number;
	name: string;
	status: string;
	statusimgsrc?: string;
};

function renderItem({name, status}: PickedStage) {
	return (
		<ListItem sx={{my: 1, margin: "0px", padding: "0px"}}>
			{status + " " + name}
		</ListItem>
	);
}

const App = () => {
	const [stages, setStages] = useReplicant<Stages>("stages", initialValue);
	const [pickedStages, setPickedStages] = useState<PickedStage[]>([]);
	console.log("処理開始！！！！！！！！！！！！！！！！！");
	console.log(setStages);

	useEffect(() => {
		// chosenOrderプロパティが存在する要素だけをフィルタリング
		const filteredStages = stages.filter(
			(stage) => stage.chosenOrder !== undefined,
		);

		// chosenOrderプロパティで昇順にソート
		filteredStages.sort((a, b) => (a.chosenOrder ?? 0) - (b.chosenOrder ?? 0));

		// PickedStage型のStateを更新
		setPickedStages(
			filteredStages.map((stage) => ({
				chosenOrder: stage.chosenOrder,
				name: stage.name,
				status: stage.status || "", // statusがundefinedの場合を考慮
				statusimgsrc: stage.statusimgsrc,
			})),
		);
	}, [stages]);

	return (
		<div>
			<FontStyles />
			<List sx={{mt: 2}}>
				<TransitionGroup>
					{pickedStages.map((e) => (
						<Collapse key={e.chosenOrder}>{renderItem(e)}</Collapse>
					))}
				</TransitionGroup>
			</List>
		</div>
	);
};

render(<App />);

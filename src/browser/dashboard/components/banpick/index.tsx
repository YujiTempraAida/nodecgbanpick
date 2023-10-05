import {FC, useState} from "react";
import {Button, Grid, Switch, ToggleButton} from "@mui/material";
import {useReplicant} from "use-nodecg";
import {Stages} from "../../../../nodecg/generated";
import imgPath0 from "../../images/0.png";
import imgPath1 from "../../images/1.png";
import imgPath2 from "../../images/2.png";
import imgPath3 from "../../images/3.png";
import imgPath4 from "../../images/4.png";
import imgPath5 from "../../images/5.png";
import imgPath6 from "../../images/6.png";
import bannedImage from "../../images/banned.png";
import pickedImage from "../../images/picked.png";

type Status = {
	banned: string;
	picked: string;
	default: string;
};

const status: Status = {
	banned: "拒否",
	picked: "選択",
	default: "",
};

const initialValue: Stages = [
	{
		id: 0,
		name: "終点",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath0,
		chosenOrder: undefined,
	},
	{
		id: 1,
		name: "戦場",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath1,
		chosenOrder: undefined,
	},
	{
		id: 2,
		name: "ポケモンスタジアム2",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath2,
		chosenOrder: undefined,
	},
	{
		id: 3,
		name: "ホロウバスティオン",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath3,
		chosenOrder: undefined,
	},
	{
		id: 4,
		name: "小戦場",
		isStarter: true,
		isChosen: false,
		imgsrc: imgPath4,
		chosenOrder: undefined,
	},
	{
		id: 5,
		name: "村と街",
		isStarter: false,
		isChosen: false,
		imgsrc: imgPath5,
		chosenOrder: undefined,
	},
	{
		id: 6,
		name: "すま村",
		isStarter: false,
		isChosen: false,
		imgsrc: imgPath6,
		chosenOrder: undefined,
	},
];

export const Banpick: FC = () => {
	const [stages, setStages] = useReplicant<Stages>("stages", initialValue);
	const [isCounterAppear, setIsCounterAppear] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const chosenNum = stages.filter((e) => e.isChosen == true).length;
	console.log("―――――BanPick UI 描画―――――");

	if (stages == null) {
		return <></>;
	}

	const handleToggleChange = (id: number) => {
		const updatedStages = stages.map((e) => {
			if (e.id === id) {
				if (!isCounterAppear) {
					// スターターBANフェーズ
					if (chosenNum < 3 && e.status == "") {
						// BAN
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.banned,
							statusimgsrc: bannedImage,
							chosenOrder: chosenNum,
						};
					} else if (chosenNum == 3 && e.status == "") {
						setIsButtonDisabled(true);
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.picked,
							statusimgsrc: pickedImage,
							chosenOrder: chosenNum,
						};
					} else {
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.default,
							statusimgsrc: "",
							chosenOrder: undefined,
						};
					}
				} else {
					// カウンター、1-2はBAN、3はピック
					if (chosenNum < 2 && e.status == "") {
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.banned,
							statusimgsrc: bannedImage,
							chosenOrder: chosenNum,
						};
					} else if (chosenNum == 2 && e.status == "") {
						setIsButtonDisabled(true);
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.picked,
							statusimgsrc: pickedImage,
							chosenOrder: chosenNum,
						};
					} else {
						return {
							...e,
							isChosen: !e.isChosen,
							status: status.default,
							statusimgsrc: "",
							chosenOrder: undefined,
						};
					}
				}
			}

			return e;
		});

		setStages(updatedStages);
	};

	const handleButtonClick = () => {
		// disabledだったら戻す
		setIsButtonDisabled(false);

		// 全部chosenをfalseにする処理
		const allNotSelectedStages = stages.map((e) => {
			return {
				...e,
				isChosen: false,
				status: status.default,
				statusimgsrc: "",
				chosenOrder: undefined,
			};
		});

		setStages(allNotSelectedStages);
	};

	return (
		<>
			<Grid container spacing={2} justifyContent='center'>
				<Grid item>{chosenNum + " chosen"}</Grid>
				<Grid item>
					<Button variant='contained' onClick={handleButtonClick}>
						Reset
					</Button>
				</Grid>
				<Grid item>
					<Switch
						checked={isCounterAppear}
						onChange={(e) => {
							handleButtonClick();
							setIsCounterAppear(e.currentTarget.checked);
						}}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} justifyContent='center'>
				{stages?.map((e) => {
					if (!e.isStarter) {
						return null;
					}
					console.log(e.name + ": " + e.status);
					return (
						<Grid item>
							<ToggleButton
								key={e.id}
								value={e.id}
								selected={e.isChosen}
								onChange={() => handleToggleChange(e.id)}
								sx={{
									backgroundImage: `url(${e.imgsrc})`,
									backgroundSize: "cover", // 画像をカバーするように設定
									backgroundRepeat: "no-repeat", // 画像を繰り返し表示しないように設定
									width: "250px", // ボタンの幅
									height: "140px", // ボタンの高さ
								}}
								disabled={isButtonDisabled}
							>
								<img src={e.statusimgsrc}></img>
							</ToggleButton>
						</Grid>
					);
				})}
			</Grid>

			<Grid container spacing={2} justifyContent='center'>
				{stages?.map((e) => {
					if (!isCounterAppear || e.isStarter) {
						return null;
					}
					console.log(e.name + ": " + e.status);
					return (
						<Grid item>
							<ToggleButton
								key={e.id}
								value={e.id}
								selected={e.isChosen}
								onChange={() => handleToggleChange(e.id)}
								sx={{
									backgroundImage: `url(${e.imgsrc})`,
									backgroundSize: "cover", // 画像をカバーするように設定
									backgroundRepeat: "no-repeat", // 画像を繰り返し表示しないように設定
									width: "250px", // ボタンの幅
									height: "140px", // ボタンの高さ
								}}
								disabled={isButtonDisabled}
							>
								<img src={e.statusimgsrc}></img>
							</ToggleButton>
						</Grid>
					);
				})}
			</Grid>
		</>
	);
};

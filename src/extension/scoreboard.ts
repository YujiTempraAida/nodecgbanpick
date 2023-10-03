import {NodeCG} from "./nodecg";
import { Scoreboard } from "../nodecg/generated";

export const scoreboard = (nodecg: NodeCG) => {
	// 今後の実装でなんかあったらログ出すようにする
	// const log = new nodecg.Logger("scoreboard");
	const defaultValue: Scoreboard = {name:"",score:0}
	const scoreboardRep = nodecg.Replicant("scoreboard",{defaultValue: defaultValue})

	const updateScoreboard = (data: Scoreboard) => {
		scoreboardRep.value.name = data.name
		scoreboardRep.value.score = data.score
	}

	nodecg.listenFor("scoreboard:update",updateScoreboard)
};

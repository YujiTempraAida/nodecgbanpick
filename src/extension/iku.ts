import {NodeCG} from "./nodecg";
import { Iku } from "../nodecg/generated";

export const scoreboard = (nodecg: NodeCG) => {
	// 今後の実装でなんかあったらログ出すようにする
	const log = new nodecg.Logger("scoreboard");
	const defaultValue: Iku = {isIku: false}
	const ikuRep = nodecg.Replicant("iku")

	ikuRep.on("change", (()=>{
		log.info("isIku: " + ikuRep.value?.isIku ? "iku" : "ikanai")
	}))

	ikuRep.value = defaultValue

};

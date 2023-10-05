import {NodeCG} from "./nodecg";

export const stages = (nodecg: NodeCG) => {
	// 今後の実装でなんかあったらログ出すようにする
	const log = new nodecg.Logger("stages");

	// stagesRepの初期化
	const stagesRep = nodecg.Replicant("stages");
	log.info(stagesRep);
};

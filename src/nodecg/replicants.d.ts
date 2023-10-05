import {Scoreboard} from "./generated";
import {Iku} from "./generated";
import {Stages} from "./generated";

type Stage = Stages[number];

type ReplicantMap = {
	scoreboard: Scoreboard;
	iku: Iku;
	stages: Stages;
};

export type {ReplicantMap, Scoreboard, Iku, Stage, Stages};

import { AlgorithmID } from "@ta/shared/utils";
import { executeGen1 } from "./genetic_algo1";
import { executeGen2 } from "./genetic_algo2";
import { executeSA } from "./simulatedAnnealing";

export const algorithmOptions = [
    {
        id: AlgorithmID.EXECUTE_GEN1,
        name: "Randomized Genetic Algorithm",
        algorithm: executeGen1,
    },
    {
        id: AlgorithmID.EXECUTE_GEN2,
        name: "Greedy and Maximal Genetic Algorithm",
        algorithm: executeGen2,
    },
    {
        id: AlgorithmID.EXECUTE_SA,
        name: "Simulated Annealing",
        algorithm: executeSA,
    },
];

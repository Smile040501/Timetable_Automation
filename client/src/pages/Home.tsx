import React from "react";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import executeGeneticAlgo1 from "../algorithms/genetic_algo1";
import executeGeneticAlgo2 from "../algorithms/genetic_algo2";
import executeSimulatedAnnealing from "../algorithms/simulatedAnnealing";

const Home: React.FC = () => {
    return (
        <>
            <Paper
                sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: 240,
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                <Typography component="p" variant="h4">
                    Upload the required data and
                    <br /> select the algorithm to generate the timetable
                </Typography>
            </Paper>
            <header className="App-header">
                <button onClick={() => executeGeneticAlgo1()}>
                    Execute Genetic Algo 1
                </button>
                <br />
                <button onClick={() => executeGeneticAlgo2()}>
                    Execute Genetic Algo 2
                </button>
                <br />
                <button onClick={() => executeSimulatedAnnealing()}>
                    Execute Simulated Annealing
                </button>
            </header>
        </>
    );
};

export default Home;

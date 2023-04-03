import React from "react";

import logo from "./logo.svg";
import "./App.css";
import executeGeneticAlgo1 from "./algorithms/genetic_algo1";
import executeGeneticAlgo2 from "./algorithms/genetic_algo2";
import executeSimulatedAnnealing from "./algorithms/simulatedAnnealing";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
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
        </div>
    );
}

export default App;

import random from "lodash/random";

import Data from "./data";
import Population from "./population";
import Schedule from "./schedule";

export default class GeneticAlgorithm {
    POPULATION_SIZE = 9;
    NUM_ELITE_SCHEDULES = 1;
    TOURNAMENT_SELECTION_SIZE = 3;
    CROSSOVER_PROB = 0.5;
    MUTATION_RATE = 0.1;

    public population: Population;

    constructor(public data: Data) {
        this.population = new Population(this.data, this.POPULATION_SIZE);
        this.population.sort();
    }

    evolve = (population: Population) =>
        this.mutatePopulation(this.crossoverPopulation(population));

    crossoverPopulation = (population: Population) => {
        const crossoverPop = new Population(this.data, 0);
        // Take elite schedules as it is to next generation
        // These are schedules with less number of conflicts as schedules will be in sorted order
        for (let i = 0; i < this.NUM_ELITE_SCHEDULES; ++i) {
            crossoverPop.schedules.push(population.schedules[i]);
        }

        // Do crossover from the remaining schedules
        // Do tournament selection and pick the one with highest fitness
        for (let i = this.NUM_ELITE_SCHEDULES; i < this.POPULATION_SIZE; ++i) {
            const sch1 =
                this.selectTournamentPopulation(population).schedules[0];
            const sch2 =
                this.selectTournamentPopulation(population).schedules[0];
            crossoverPop.schedules.push(this.crossoverSchedule(sch1, sch2));
        }

        crossoverPop.size = this.POPULATION_SIZE;
        return crossoverPop;
    };

    mutatePopulation = (population: Population) => {
        // Mutate each schedule other than the elite schedules
        for (let i = this.NUM_ELITE_SCHEDULES; i < this.POPULATION_SIZE; ++i) {
            this.mutateSchedule(population.schedules[i]);
        }
        return population;
    };

    crossoverSchedule = (schedule1: Schedule, schedule2: Schedule) => {
        // Create a new schedule and based on the random number,
        // take a class for it from either first or the second schedule
        const crossoverSch = new Schedule(this.data).initialize();
        for (let i = 0; i < crossoverSch.classes.length; ++i) {
            crossoverSch.classes[i] =
                Math.random() > this.CROSSOVER_PROB
                    ? schedule1.classes[i]
                    : schedule2.classes[i];
        }
        return crossoverSch;
    };

    mutateSchedule = (schedule: Schedule) => {
        // Based on the mutation rate, introduce a new class into the schedule from a new schedule
        const sch = new Schedule(this.data).initialize();
        for (let i = 0; i < schedule.classes.length; ++i) {
            if (Math.random() < this.MUTATION_RATE) {
                schedule.classes[i] = sch.classes[i];
            }
        }
        return schedule;
    };

    selectTournamentPopulation = (population: Population) => {
        // Randomly select schedules of tournament size into a new population
        // Return the sorted population
        const tournamentPop = new Population(this.data, 0);
        for (let i = 0; i < this.TOURNAMENT_SELECTION_SIZE; ++i) {
            tournamentPop.schedules.push(
                population.schedules[random(0, population.schedules.length - 1)]
            );
        }
        tournamentPop.sort();
        tournamentPop.size = this.TOURNAMENT_SELECTION_SIZE;
        return tournamentPop;
    };

    execute = (upperBound = -1) => {
        let generationNumber = 0;

        while (this.population.schedules[0].fitness < 1.0) {
            ++generationNumber;
            console.log(
                `Generation: ${generationNumber}
                Conflicts: ${this.population.schedules[0].conflicts.length}, Fitness : ${this.population.schedules[0].fitness}`
            );
            this.population = this.evolve(this.population);
            this.population.sort();
            if (upperBound !== -1 && generationNumber === upperBound) {
                break;
            }
        }
        console.log(
            `End:
                Conflicts: ${this.population.schedules[0].conflicts.length}, Fitness : ${this.population.schedules[0].fitness}`
        );
        return [generationNumber, this.population.schedules[0].fitness];
    };
}

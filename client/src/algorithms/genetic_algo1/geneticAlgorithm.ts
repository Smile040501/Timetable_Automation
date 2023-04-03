import random from "lodash/random";

import Data from "../models/data";
import Population from "../models/population";
import Schedule from "./schedule";

export default class GeneticAlgorithm {
    POPULATION_SIZE = 9;
    NUM_ELITE_SCHEDULES = 1;
    TOURNAMENT_SELECTION_SIZE = 3;
    CROSSOVER_PROB = 0.5;
    MUTATION_RATE = 0.1;
    BEST_SCHEDULE_FITNESS = 1.0;
    MAX_GENERATIONS_WITH_SAME_FITNESS = 1000;

    public population: Population;

    constructor(public data: Data) {
        this.population = new Population(
            this.data,
            this.POPULATION_SIZE,
            Schedule
        );
        Population.sort(this.population.schedules);
    }

    evolve = (population: Population) =>
        this.mutatePopulation(this.crossoverPopulation(population));

    crossoverPopulation = (population: Population) => {
        const crossoverPop = new Population(this.data, 0, Schedule);
        // Take elite schedules as it is to next generation
        // These are schedules with less number of conflicts as schedules will be in sorted order
        for (let i = 0; i < this.NUM_ELITE_SCHEDULES; ++i) {
            crossoverPop.schedules.push(population.schedules[i]);
        }

        // Do crossover from the remaining schedules
        // Do tournament selection and pick the one with highest fitness
        for (let i = this.NUM_ELITE_SCHEDULES; i < this.POPULATION_SIZE; ++i) {
            const sch1 = this.selectTournamentPopulation(population)
                .schedules[0] as Schedule;
            const sch2 = this.selectTournamentPopulation(population)
                .schedules[0] as Schedule;
            crossoverPop.schedules.push(this.crossoverSchedule(sch1, sch2));
        }

        crossoverPop.size = this.POPULATION_SIZE;
        return crossoverPop;
    };

    mutatePopulation = (population: Population) => {
        // Mutate each schedule other than the elite schedules
        for (let i = this.NUM_ELITE_SCHEDULES; i < this.POPULATION_SIZE; ++i) {
            this.mutateSchedule(population.schedules[i] as Schedule);
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
        const tournamentPop = new Population(this.data, 0, Schedule);
        for (let i = 0; i < this.TOURNAMENT_SELECTION_SIZE; ++i) {
            tournamentPop.schedules.push(
                population.schedules[random(0, population.schedules.length - 1)]
            );
        }
        Population.sort(tournamentPop.schedules);
        tournamentPop.size = this.TOURNAMENT_SELECTION_SIZE;
        return tournamentPop;
    };

    execute = (upperBound = -1) => {
        let generationNumber = 0;
        let bestSchedule = this.population.schedules[0] as Schedule;
        let previousFitness = 0,
            hasFitnessChanged = true,
            numGenerationsWithSameFitness = 0;

        while (true) {
            ++generationNumber;
            console.log(
                `Generation: ${generationNumber}
                Conflicts: ${bestSchedule.conflicts.length}, Fitness: ${bestSchedule.fitness}`
            );

            previousFitness = bestSchedule.fitness;
            this.population = this.evolve(this.population);
            Population.sort(this.population.schedules);
            bestSchedule = this.population.schedules[0] as Schedule;

            if (upperBound !== -1 && generationNumber === upperBound) break;

            hasFitnessChanged = bestSchedule.fitness !== previousFitness;
            numGenerationsWithSameFitness = hasFitnessChanged
                ? 0
                : numGenerationsWithSameFitness + 1;

            if (
                bestSchedule.fitness >= this.BEST_SCHEDULE_FITNESS &&
                numGenerationsWithSameFitness >=
                    this.MAX_GENERATIONS_WITH_SAME_FITNESS
            ) {
                break;
            }
        }

        console.log(
            `End:
                Conflicts: ${bestSchedule.conflicts.length}, Fitness: ${bestSchedule.fitness}`
        );

        return [generationNumber, bestSchedule] as [number, Schedule];
    };
}

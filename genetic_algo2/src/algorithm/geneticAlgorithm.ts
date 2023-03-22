import cloneDeep from "lodash/cloneDeep";
import shuffle from "lodash/shuffle";
import random from "lodash/random";

import Data from "./data";
import Population from "./population";
import Schedule from "./schedule";
import Class from "./class";

export default class GeneticAlgorithm {
    POPULATION_SIZE = 9;
    NUM_ELITE_SCHEDULES = 0;
    TOURNAMENT_SELECTION_SIZE = 3;
    CROSSOVER_PROB = 0.5;
    MUTATION_RATE = 0.1;
    ALL_PAIR_PARENTS = false;

    public population: Population;

    constructor(public data: Data) {
        this.population = new Population(this.data, this.POPULATION_SIZE);
        Population.sort(this.population.schedules);
    }

    evolve = (population: Population) =>
        this.mutatePopulation(this.crossoverPopulation(population));

    crossoverPopulation = (population: Population) => {
        const crossoverPop = new Population(this.data, 0);
        const schedules: Schedule[] = [];

        // Take elite schedules as it is to next generation
        // These are schedules with less number of conflicts as schedules will be in sorted order
        for (let i = 0; i < this.NUM_ELITE_SCHEDULES; ++i) {
            schedules.push(population.schedules[i]);
        }

        if (!this.ALL_PAIR_PARENTS) {
            // Do crossover from the remaining schedules
            // Do tournament selection and pick the one with highest fitness
            for (
                let i = this.NUM_ELITE_SCHEDULES;
                i < this.POPULATION_SIZE;
                ++i
            ) {
                const sch1 =
                    this.selectTournamentPopulation(population).schedules[0];
                const sch2 =
                    this.selectTournamentPopulation(population).schedules[0];
                schedules.push(...this.crossoverSchedule(sch1, sch2));
            }
        } else {
            for (
                let i = this.NUM_ELITE_SCHEDULES;
                i < this.POPULATION_SIZE;
                ++i
            ) {
                for (let j = i + 1; j < this.POPULATION_SIZE; ++j) {
                    const newSchedules = this.crossoverSchedule(
                        this.population.schedules[i],
                        this.population.schedules[j]
                    );
                    schedules.push(...newSchedules);
                }
            }
        }

        Population.sort(schedules);

        crossoverPop.size = this.POPULATION_SIZE;
        crossoverPop.schedules = schedules.slice(0, this.POPULATION_SIZE);
        return crossoverPop;
    };

    mutatePopulation = (population: Population): Population => {
        // Mutate each schedule other than the elite schedules
        for (let i = this.NUM_ELITE_SCHEDULES; i < this.POPULATION_SIZE; ++i) {
            this.mutateSchedule(population.schedules[i]);
        }
        return population;
    };

    crossoverSchedule = (
        schedule1: Schedule,
        schedule2: Schedule
    ): Schedule[] => {
        const classes1 = [
            ...schedule1.allocatedClasses,
            ...schedule1.unallocatedClasses,
        ];
        const classes2 = [
            ...schedule2.allocatedClasses,
            ...schedule2.unallocatedClasses,
        ];
        const offspring: [Class[], Class[]][] = [];
        for (let i = 0; i < 4; ++i) {
            if (Math.random() >= this.CROSSOVER_PROB) {
                continue;
            }
            const allocatedClasses: Class[] = [];
            let unallocatedClasses: Class[] = [];
            if (i < 2) {
                for (let j = 0; j < classes1.length; ++j) {
                    const class1 =
                        i === 0
                            ? cloneDeep(classes1[j])
                            : cloneDeep(classes2[j]);
                    const class2 =
                        i === 0
                            ? cloneDeep(classes2[j])
                            : cloneDeep(classes1[j]);
                    if (
                        !Schedule.isClassPresent(class1, allocatedClasses) &&
                        !Schedule.isClassPresent(class1, unallocatedClasses) &&
                        !Schedule.allocateSlot(
                            class1,
                            allocatedClasses,
                            this.data
                        )
                    ) {
                        unallocatedClasses.push(class1);
                    }
                    if (
                        !Schedule.isClassPresent(class2, allocatedClasses) &&
                        !Schedule.isClassPresent(class2, unallocatedClasses) &&
                        !Schedule.allocateSlot(
                            class2,
                            allocatedClasses,
                            this.data
                        )
                    ) {
                        unallocatedClasses.push(class2);
                    }
                }
            } else {
                for (let j = classes1.length - 1; j >= 0; --j) {
                    const class1 =
                        i === 2
                            ? cloneDeep(classes1[j])
                            : cloneDeep(classes2[j]);
                    const class2 =
                        i === 2
                            ? cloneDeep(classes2[j])
                            : cloneDeep(classes1[j]);
                    if (
                        !Schedule.isClassPresent(class1, allocatedClasses) &&
                        !Schedule.isClassPresent(class1, unallocatedClasses) &&
                        !Schedule.allocateSlot(
                            class1,
                            allocatedClasses,
                            this.data
                        )
                    ) {
                        unallocatedClasses.push(class1);
                    }
                    if (
                        !Schedule.isClassPresent(class2, allocatedClasses) &&
                        !Schedule.isClassPresent(class2, unallocatedClasses) &&
                        !Schedule.allocateSlot(
                            class2,
                            allocatedClasses,
                            this.data
                        )
                    ) {
                        unallocatedClasses.push(class2);
                    }
                }
            }
            unallocatedClasses = unallocatedClasses.filter(
                (cls) => !Schedule.isClassPresent(cls, allocatedClasses)
            );

            offspring.push([allocatedClasses, unallocatedClasses]);
        }
        const schedules: Schedule[] = [];
        for (const [allocatedClasses, unallocatedClasses] of offspring) {
            const sch = new Schedule(this.data);
            sch.allocatedClasses = allocatedClasses;
            sch.unallocatedClasses = unallocatedClasses;
            sch.allClasses = [...allocatedClasses, ...unallocatedClasses];
        }
        return schedules;
    };

    mutateSchedule = (schedule: Schedule): Schedule => {
        let maxNewAllocatedClasses: Class[] = schedule.allocatedClasses;
        let minNewUnallocatedClasses: Class[] = schedule.unallocatedClasses;

        // Pick randomly from allocated courses and unallocate it
        // and try allocating the unallocated courses
        for (let i = 0; i < schedule.allocatedClasses.length; ++i) {
            if (Math.random() >= this.MUTATION_RATE) {
                continue;
            }
            const allocatedClasses = cloneDeep([...schedule.allocatedClasses]);
            const unallocatedClasses = cloneDeep([
                ...schedule.unallocatedClasses,
            ]);
            const allocatedClass = allocatedClasses[i];
            const newAllocatedClasses = allocatedClasses.filter(
                (cls) => cls !== allocatedClass
            );
            for (const unallocatedClass of shuffle(unallocatedClasses)) {
                Schedule.allocateSlot(
                    unallocatedClass,
                    newAllocatedClasses,
                    this.data
                );
            }
            Schedule.allocateSlot(
                allocatedClass,
                newAllocatedClasses,
                this.data
            );

            // If new allocation is better than the previous
            if (newAllocatedClasses.length >= maxNewAllocatedClasses.length) {
                maxNewAllocatedClasses = newAllocatedClasses;
                minNewUnallocatedClasses = unallocatedClasses.filter(
                    (cls) => newAllocatedClasses.indexOf(cls) === -1
                );
                if (newAllocatedClasses.indexOf(allocatedClass) === -1) {
                    minNewUnallocatedClasses.push(allocatedClass);
                }
            }
        }

        schedule.allocatedClasses = maxNewAllocatedClasses;
        schedule.unallocatedClasses = minNewUnallocatedClasses;
        schedule.allClasses = [
            ...maxNewAllocatedClasses,
            ...minNewUnallocatedClasses,
        ];

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
        Population.sort(tournamentPop.schedules);
        tournamentPop.size = this.TOURNAMENT_SELECTION_SIZE;
        return tournamentPop;
    };

    execute = () => {
        let generationNumber = 0;

        while (this.population.schedules[0].fitness < 1.0) {
            ++generationNumber;
            console.log(
                `Generation: ${generationNumber}
                Allocated: ${this.population.schedules[0].allocatedClasses.length}, Fitness : ${this.population.schedules[0].fitness}`
            );
            this.population = this.evolve(this.population);
            Population.sort(this.population.schedules);
        }
        console.log(
            `End:
                Allocated: ${this.population.schedules[0].allocatedClasses.length}, Fitness : ${this.population.schedules[0].fitness}`
        );
    };
}

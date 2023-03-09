function Tuner(){
    function randomInteger(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }

    function normalize(candidate){
        var norm = Math.sqrt(candidate.heightWeight * candidate.heightWeight + candidate.linesWeight * candidate.linesWeight + candidate.holesWeight * candidate.holesWeight + candidate.bumpinessWeight * candidate.bumpinessWeight);
        candidate.heightWeight /= norm;
        candidate.linesWeight /= norm;
        candidate.holesWeight /= norm;
        candidate.bumpinessWeight /= norm;
    }

    function generateRandomCandidate(){
        var candidate = {
            heightWeight: Math.random() - 0.5,
            linesWeight: Math.random() - 0.5,
            holesWeight: Math.random() - 0.5,
            bumpinessWeight: Math.random() - 0.5
        };
        normalize(candidate);
        return candidate;
    }

    function sort(candidates){
        candidates.sort(function(a, b){
            return b.fitness - a.fitness;
        });
    }

    function computeFitnesses(candidates, numberOfGames, maxNumberOfMoves){
        for(var i = 0; i < candidates.length; i++){
            var candidate = candidates[i];
            var ai = new AI(candidate);
            var totalScore = 0;
            for(var j = 0; j < numberOfGames; j++){
                var grid = new Grid(22, 10);
                var rpg = new RandomPieceGenerator();
                var workingPieces = [rpg.nextPiece(), rpg.nextPiece()];
                var workingPiece = workingPieces[0];
                var score = 0;
                var numberOfMoves = 0;
                while((numberOfMoves++) < maxNumberOfMoves && !grid.exceeded()){
                    workingPiece = ai.best(grid, workingPieces);
                    while(workingPiece.moveDown(grid));
                    grid.addPiece(workingPiece);
                    score += grid.clearLines();
                    for(var k = 0; k < workingPieces.length - 1; k++){
                        workingPieces[k] = workingPieces[k + 1];
                    }
                    workingPieces[workingPieces.length - 1] = rpg.nextPiece();
                    workingPiece = workingPieces[0];
                }
                totalScore += score;
            }
            candidate.fitness = totalScore;
        }
    }

    function tournamentSelectPair(candidates, ways){
        var indices = [];
        for(var i = 0; i <  candidates.length; i++){
            indices.push(i);
        }

        /*
            Note that the following assumes that the candidates array is
            sorted according to the fitness of each individual candidates.
            Hence it suffices to pick the least 2 indexes out of the random
            ones picked.
        */
        var fittestCandidateIndex1 = null;
        var fittestCandidateIndex2 = null;
        for(var i = 0; i < ways; i++){
            var selectedIndex = indices.splice(randomInteger(0, indices.length), 1)[0];
            if(fittestCandidateIndex1 === null || selectedIndex < fittestCandidateIndex1){
                fittestCandidateIndex2 = fittestCandidateIndex1;
                fittestCandidateIndex1 = selectedIndex;
            }else if (fittestCandidateIndex2 === null || selectedIndex < fittestCandidateIndex2){
                fittestCandidateIndex2 = selectedIndex;
            }
        }
        return [candidates[fittestCandidateIndex1], candidates[fittestCandidateIndex2]];
    }

    function crossOver(candidate1, candidate2){
        var candidate = {
            heightWeight: candidate1.fitness * candidate1.heightWeight + candidate2.fitness * candidate2.heightWeight,
            linesWeight: candidate1.fitness * candidate1.linesWeight + candidate2.fitness * candidate2.linesWeight,
            holesWeight: candidate1.fitness * candidate1.holesWeight + candidate2.fitness * candidate2.holesWeight,
            bumpinessWeight: candidate1.fitness * candidate1.bumpinessWeight + candidate2.fitness * candidate2.bumpinessWeight
        };
        normalize(candidate);
        return candidate;
    }

    function mutate(candidate){
        var quantity = Math.random() * 0.4 - 0.2; // plus/minus 0.2
        switch(randomInteger(0, 4)){
            case 0:
                candidate.heightWeight += quantity;
                break;
            case 1:
                candidate.linesWeight += quantity;
                break;
            case 2:
                candidate.holesWeight += quantity;
                break;
            case 3:
                candidate.bumpinessWeight += quantity;
                break;
        }
    }

    function deleteNLastReplacement(candidates, newCandidates){
        candidates.splice(-newCandidates.length);
        for(var i = 0; i < newCandidates.length; i++){
            candidates.push(newCandidates[i]);
        }
        sort(candidates);
    }

    /**
     * @param {Object} [params]
     * @param {number} [params.population=100] Population size
     * @param {number} [params.rounds=5] Rounds per candidate
     * @param {number} [params.moves=200] Max moves per round
     */
    this.tune = function(params){
        var config = Object.assign({}, params, {
            // Defaults:
            // Theoretical fitness limit = 5 * 200 * 4 / 10 = 400
            population: 100,
            rounds: 5,
            moves: 200
        });
        var candidates = [];

        // Initial population generation
        for(var i = 0; i < config.population; i++){
            candidates.push(generateRandomCandidate());
        }

        console.log('Computing fitnesses of initial population...');
        computeFitnesses(candidates, config.rounds, config.moves);
        sort(candidates);

        var count = 0;
        while(true){
            var newCandidates = [];
            for(var i = 0; i < 30; i++){ // 30% of population
                var pair = tournamentSelectPair(candidates, 10); // 10% of population
                //console.log('fitnesses = ' + pair[0].fitness + ',' + pair[1].fitness);
                var candidate = crossOver(pair[0], pair[1]);
                if(Math.random() < 0.05){// 5% chance of mutation
                    mutate(candidate);
                }
                normalize(candidate);
                newCandidates.push(candidate);
            }
            console.log('Computing fitnesses of new candidates. (' + count + ')');
            computeFitnesses(newCandidates, config.rounds, config.moves);
            deleteNLastReplacement(candidates, newCandidates);
            var totalFitness = 0;
            for(var i = 0; i < candidates.length; i++){
                totalFitness += candidates[i].fitness;
            }
            console.log('Average fitness = ' + (totalFitness / candidates.length));
            console.log('Highest fitness = ' + candidates[0].fitness + '(' + count + ')');
            console.log('Fittest candidate = ' + JSON.stringify(candidates[0]) + '(' + count + ')');
            count++;
        }
    };
}

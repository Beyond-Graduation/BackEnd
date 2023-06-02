function backtrack(arr, currentCombination, start, combinations) {
    combinations.push([...currentCombination]);

    for (let i = start; i < arr.length; i++) {
        currentCombination.push(arr[i]);
        backtrack(arr, currentCombination, i + 1, combinations);
        currentCombination.pop();
    }
}

function generateCombinations(arr) {
    const combinations = [];
    backtrack(arr, [], 0, combinations);
    const filteredCombinations = combinations.filter(combination => combination.length > 1);

    // Sort the remaining arrays in descending order based on the number of elements
    filteredCombinations.sort((a, b) => b.length - a.length);
    return filteredCombinations;
}

module.exports = { generateCombinations };
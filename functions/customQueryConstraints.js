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
    return combinations;
}

module.exports = { generateCombinations };
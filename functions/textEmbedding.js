const { getWord2VecModel } = require('../functions/word2vecLoader');
const { loadWord2VecModel } = require("../functions/word2vecLoader");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stopwords = require('stopwords').english;


// Function to preprocess the text
function preprocessText(text) {
    // Tokenization
    const tokens = tokenizer.tokenize(text);

    // Removing punctuation and converting to lowercase
    const processedTokens = tokens.map(token => token.replace(/[^\w\s]/gi, '').toLowerCase());

    // Removing stop words
    const filteredTokens = processedTokens.filter(token => !stopwords.includes(token));
    return filteredTokens;

}



// Function to perform Word2Vec embedding using the loaded Word2Vec model
// Content must be plain text
async function performWord2VecEmbedding(content) {
    await loadWord2VecModel(); // Wait for the embedding model to be loaded

    var model = getWord2VecModel();
    if (!model) {
        throw new Error("Word2Vec model not yet loaded!");
    }

    // Preprocess the content and split it into individual tokens
    const tokens = preprocessText(content);

    // Initialize the sum embedding vector
    let sumEmbedding = null;

    // Calculate the sum of embeddings for all tokens
    let validTokensCount = 0; // Count the number of tokens with valid embeddings
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const embedding = model.getVector(token);
        if (embedding) {
            validTokensCount++;
            if (!sumEmbedding) {
                sumEmbedding = embedding.values;
            } else {
                sumEmbedding = sumEmbedding.map((value, index) => value + embedding.values[index]);
            }
        }
    }
    // Calculate the average embedding
    const avgEmbedding = sumEmbedding.map((sum) => sum / validTokensCount);
    return Array.from(avgEmbedding);

}

module.exports = { preprocessText, performWord2VecEmbedding };
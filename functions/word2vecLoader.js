const word2vec = require('word2vec');

let word2vecModel;
let loadingPromise;

function loadWord2VecModel() {
    if (loadingPromise) {
        return loadingPromise; // Return the existing loading promise if available
    }

    if (word2vecModel) {
        return Promise.resolve(); // Return a resolved promise if the model is already loaded
    }

    loadingPromise = new Promise((resolve, reject) => {
        word2vec.loadModel('./embeddings/glove.6B/glove.6B.200d.txt', (error, model) => {
            if (error) {
                console.error('Failed to load Word2Vec model:', error);
                reject(error);
            } else {
                word2vecModel = model;
                console.log('Word2Vec model loaded successfully');
                resolve();
            }
        });
    });

    return loadingPromise;
}

function getWord2VecModel() {
    return word2vecModel;
}

module.exports = { loadWord2VecModel, getWord2VecModel };
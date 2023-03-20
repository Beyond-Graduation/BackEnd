from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
import sys
import pandas as pd

import nltk
# nltk.download('stopwords')
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('omw-1.4')

from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from scipy.sparse import csr_matrix

import requests
from bs4 import BeautifulSoup
import numpy as np
from cleantext import clean
import pickle
import json
import bson.json_util as json_util





STOPWORDS = set(stopwords.words('english'))
MIN_WORDS = 1
MAX_WORDS = 200

PATTERN_S = re.compile("\'s")  # matches `'s` from text  
PATTERN_RN = re.compile("\\r\\n") #matches `\r` and `\n`
PATTERN_PUNC = re.compile(r"[^\w\s]") # matches all non 0-9 A-z whitespace 

# Basic Python Script to establish MongoDB Connection

def get_database():
 
    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    #CONNECTION_STRING = "mongodb+srv://user:pass@cluster.mongodb.net/myFirstDatabase"
    CONNECTION_STRING = os.getenv("DATABASE_URL")
 
    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(CONNECTION_STRING)
 
    # Create the database for our example (we will use the same database throughout the tutorial
    return client['miniproject']


def isNumber(num):
  num = num.strip('%')
  try:
    float(num)
    return True
  except:
    try:
      float(num[0])
      return True
    except:
      return False

def clean_text(text):
    """
    Series of cleaning. String to lower case, remove non words characters and numbers (punctuation, curly brackets etc).
        text (str): input text
    return (str): modified initial text
    """
    text = clean(text, no_emoji=True)
    text = text.lower()  # lowercase text

    # Cleaning emojis out
    
    # replace the matched string with ' '
    text = re.sub(PATTERN_S, ' ', text)
    text = re.sub(PATTERN_RN, ' ', text)
    text = re.sub(PATTERN_PUNC, ' ', text)

    return text

def tokenizer(sentence, min_words=MIN_WORDS, max_words=MAX_WORDS, stopwords=STOPWORDS, lemmatize=True):
    """
    Lemmatize, tokenize, crop and remove stop words.
    Args:
      sentence (str)
      min_words (int)
      max_words (int)
      stopwords (set of string)
      lemmatize (boolean)
    returns:
      list of string
    """
    if lemmatize:
        stemmer = WordNetLemmatizer()
        tokens = [stemmer.lemmatize(w) for w in word_tokenize(sentence)]
    else:
        tokens = [w for w in word_tokenize(sentence)]
    
    tokens = [w for w in tokens if (w not in stopwords and len(w)>min_words and isNumber(w)==False and w.isalnum()==True)]

    return tokens 



def vectorize_article(blogId,vectorizer):
    db = get_database()
    blogs = db['blogs']
    article = blogs.find_one({'blogId': blogId})
    soup = BeautifulSoup(article["content"], 'html.parser')
    input_article = soup.get_text()
    input_article = clean_text(input_article)
    # Embed the query sentence
    
    tokens_query = " ".join(tokenizer(input_article))
    embed_query = vectorizer.transform([tokens_query])
    data_dict = {
        'data': embed_query.data.tolist(),
        'indices': embed_query.indices.tolist(),
        'indptr': embed_query.indptr.tolist(),
        'shape': embed_query.shape
    }


    update = blogs.update_one({'blogId': blogId}, {"$set": {'vector':data_dict}},True)
    # print(update)
    result = {"vector":embed_query.toarray()[0]}
    # print(json_util.dumps(result))
    return



# Load TfIdf vector object
try:
  file = open('./python_scripts/Vectorization/tfidf_medium.pickle', 'rb')
except:
   file = open('./Vectorization/tfidf_medium.pickle', 'rb')
tfidf_mat = pickle.load(file)
file.close()


if __name__ == "__main__":
    try:
        blogId = sys.argv[1]
        vectorize_article(blogId,tfidf_mat)
    except Exception as e:
        print(e)

    # db = get_database()
    # users = db['users']
    # item_details = users.find()
    # for item in item_details:
    #     for key in item:
    #         print(key," : ",item[key])
    #     print("\n")
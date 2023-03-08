from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

# Basic Python Script to establish MongoDB Connection

def get_database():
 
    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    #CONNECTION_STRING = "mongodb+srv://user:pass@cluster.mongodb.net/myFirstDatabase"
    CONNECTION_STRING = os.getenv("DATABASE_URL")
 
    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(CONNECTION_STRING)
 
    # Create the database for our example (we will use the same database throughout the tutorial
    return client['miniproject']


if __name__ == "__main__":
    db = get_database()
    users = db['users']
    item_details = users.find()
    for item in item_details:
        for key in item:
            print(key," : ",item[key])
        print("\n")
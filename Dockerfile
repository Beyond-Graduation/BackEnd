# Set the base image for Python
FROM python:3.11-alpine


# Set the working directory
WORKDIR /app

# Copy all files except the node modules folder
COPY . /app
RUN rm -rf /app/node_modules

# Install pip modules
COPY requirements.txt /app/requirements.txt
# RUN pip install -r requirements.txt

# Set the base image for Node.js
FROM node:18-alpine

# Set the working directory for Node.js
WORKDIR /app

# Copy the necessary files for Node.js
COPY package.json package-lock.json /app/

# Install npm modules
RUN apk add --no-cache make gcc musl-dev
RUN npm install

# Copy the remaining files for Node.js
COPY . /app

# Set the port the Node.js server listens on
EXPOSE 4000

# Start the Node.js server
CMD ["node", "server.js"]

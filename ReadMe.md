Decentralized Asset Tracker(DAT)

A simple educational proof of concept project to create a service that can create and manage assets of users created in ethereum blockchain. 

# Prerequites:
- install node and npm. preferrably version node v21.
- install mongo
- install truffle and ganache(using npm)

# Compile the smart contract
 - You truffle compile in asset-tracker/ to compile the .sol contract to a json file.
 - This contract is then ready to be deployed after starting ganache

# Start ganache-cli
 - To start ganache, use ganache-cli -d -db ./asset-tracker/ganache-workspace
 - Once the cli starts, use truffle compile --reset under asset-tracker directory to deploy the contracts.

# Start node server
 - Assuming that ganache is already running and contracts are deployed, use npm run start:server in ./asset-tracker-backend directory.
 - Alternatively you can use the following commands,
  * npm start, to deploy contracts and start server.
  * npm start:all to start ganache, restore assets from the db, deploy contracts and then start the server.

Explore and have fun! More updates are yet to come.


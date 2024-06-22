const Web3 = require('web3');
const contract = require('@truffle/contract');
const AssetTrackerArtifact = require('../../asset-tracker/build/contracts/AssetTracker.json');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const AssetTracker = contract(AssetTrackerArtifact);
AssetTracker.setProvider(web3.currentProvider);

module.exports = {
  web3,
  AssetTracker
};

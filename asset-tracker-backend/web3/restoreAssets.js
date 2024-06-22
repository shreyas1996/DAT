
const Web3 = require('web3');
const mongoose = require('mongoose');
const { web3, AssetTracker } = require('./web3');
const Asset = require('../models/Asset');
const User = require('../models/User');
const fs = require('fs');

async function restoreAssets() {
    try {
        await mongoose.connect('mongodb://localhost:27017/DAT', {
            useNewUrlParser: true,
            useUnifiedTopology: true
            });
            
    const accounts = JSON.parse(fs.readFileSync(__dirname + '/../config/accounts.json', 'utf8'));
    const preFundedAccount = accounts[0].address;
    const preFundedPrivateKey = accounts[0].privateKey;
    const assets = await Asset.find();
    for (const asset of assets) {
      const user = await User.findById(asset.owner);
      if (user) {
        const ethereumAddress = user.ethereumAddress;
        const instance = await AssetTracker.deployed();
        const data = instance.contract.methods.createAsset(asset.name, asset.metadata, ethereumAddress).encodeABI();

        const tx = {
          from: ethereumAddress,
          to: instance.address,
          data,
          gas: 4000000,
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(tx, preFundedPrivateKey);
        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
      }
    }

    console.log('Assets restored successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error restoring assets:', error);
    process.exit(1);
  }
}

restoreAssets();

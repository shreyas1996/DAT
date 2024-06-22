const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { web3, AssetTracker } = require('../web3/web3');
const crypto = require('crypto');
const fs = require('fs');
const router = express.Router();
const config = require('config');

const algorithm = 'aes-256-ctr';
// const secretKey = 'yourSecretKeyForEncryption'; // Use the same key used during encryption
const secretKey = config.get('privateSecret'); // Use the same key used during encryption


// Decrypt function
const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

// Load accounts from file
const accounts = JSON.parse(fs.readFileSync(__dirname + '/../config/accounts.json', 'utf8'));
const preFundedAccount = accounts[0].address;
const preFundedPrivateKey = accounts[0].privateKey;

web3.eth.getAccounts()
  .then(accounts => {
    const defaultAccount = accounts[0];

    // Create asset
    router.post('/', [auth, [
      check('name', 'Name is required').not().isEmpty(),
      check('metadata', 'Metadata is required').not().isEmpty(),
    ]], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, metadata } = req.body;

      try {
        const user = await User.findById(req.user.id);
        const ethereumAddress = user.ethereumAddress;
        const decryptedPrivateKey = decrypt(JSON.parse(user.privateKey));

        if (!web3.utils.isAddress(ethereumAddress)) {
          return res.status(400).json({ msg: 'Invalid Ethereum address' });
        }

        const instance = await AssetTracker.deployed();
        const data = instance.contract.methods.createAsset(name, metadata, ethereumAddress).encodeABI();

        const tx = {
          from: preFundedAccount,
          to: instance.address,
          data,
          gas: 4000000, // Set a gas limit,
          gasPrice: web3.utils.toWei('20', 'gwei') // Set gas price to 20 Gwei
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(tx, preFundedPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        // Ensure the transaction was successful
        if (!receipt.status) {
          throw new Error('Transaction failed');
        }

        // Extract the asset ID from the transaction receipt logs
        const event = receipt.logs.find(log => log.topics[0] === web3.utils.sha3('AssetCreated(uint256,string,string,address)'));
        if (!event) {
          throw new Error('AssetCreated event not found in transaction receipt');
        }
        console.log('Event Topics: ', event.topics);
        const decodedLogs = web3.eth.abi.decodeLog(
          [
            { type: 'uint256', name: 'id', indexed: true },
            { type: 'string', name: 'name' },
            { type: 'string', name: 'metadata' },
            { type: 'address', name: 'owner' }
          ],
          event.data,
          event.topics.slice(1)
        );

        const assetId = decodedLogs.id;

        const newAsset = new Asset({
          name,
          metadata,
          owner: req.user.id,
          ethereumAddress,
          assetId,
        });

        await newAsset.save();

        res.send('Asset created and saved in backup');
      } catch (error) {
        console.error("Error creating asset: ", error);
        res.status(500).send(error.toString());
      }
    });

    // Transfer asset
    router.put('/transfer/:id', [auth, [
      check('email', 'Recipient email is required').isEmail()
    ]], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      try {
        const currentUser = await User.findById(req.user.id);
        const currentEthereumAddress = currentUser.ethereumAddress;

        if (!web3.utils.isAddress(currentEthereumAddress)) {
          return res.status(400).json({ msg: 'Invalid Ethereum address' });
        }

        const newOwner = await User.findOne({ email });
        if (!newOwner) {
          return res.status(404).json({ msg: 'Recipient not found' });
        }
        const newOwnerEthereumAddress = newOwner.ethereumAddress;

        const instance = await AssetTracker.deployed();
        const data = instance.contract.methods.transferAsset(req.params.id, newOwnerEthereumAddress).encodeABI();

        const tx = {
          from: preFundedAccount,
          to: instance.address,
          data,
          gas: 4000000,
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(tx, preFundedPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        const assetFromBlockChain = await instance.getAsset(req.params.id);
        console.log('Asset from blockchain: ', assetFromBlockChain);
        const asset = await Asset.findOne({ name: assetFromBlockChain[0] });
        console.log('asset: ', asset);
        asset.owner = newOwner._id;
        asset.ethereumAddress = newOwnerEthereumAddress;
        await asset.save();

        res.send('Asset transferred and updated in backup');
      } catch (error) {
        console.error("Error transferring asset: ", error);
        res.status(500).send(error.toString());
      }
    });

    // Get asset by ID
    router.get('/getAsset/:id', auth, async (req, res) => {
      try {
        const instance = await AssetTracker.deployed();
        const asset = await instance.getAsset(req.params.id);

        res.json({
          name: asset[0],
          metadata: asset[1],
          owner: asset[2]
        });
      } catch (error) {
        console.error("Error fetching asset: ", error);
        res.status(500).send(error.toString());
      }
    });

    // Get all assets for a user
    router.get('/user', auth, async (req, res) => {
      try {
        const user = await User.findById(req.user.id);
        const ethereumAddress = user.ethereumAddress;

        if (!web3.utils.isAddress(ethereumAddress)) {
          return res.status(400).json({ msg: 'Invalid Ethereum address' });
        }

        const instance = await AssetTracker.deployed();
        const assetIds = await instance.getAssetsByOwner(ethereumAddress);
        console.log('Asset IDs: ', assetIds);
        const assets = await Promise.all(assetIds.map(async (id) => {
          const asset = await instance.getAsset(id);
          return {
            id,
            name: asset[0],
            metadata: asset[1],
            owner: asset[2]
          };
        }));

        // Also return the backup from MongoDB
        const backupAssets = await Asset.find({ owner: req.user.id });

        res.json({ blockchainAssets: assets, backupAssets });
      } catch (error) {
        console.error("Error fetching user assets: ", error);
        res.status(500).send(error.toString());
      }
    });

  })
  .catch(error => {
    console.error("Error fetching accounts: ", error);
  });

module.exports = router;

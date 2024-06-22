const Web3 = require('web3');
const fs = require('fs');
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet').hdkey;

// Mnemonic used by Ganache with the -d flag
const mnemonic = 'myth like bonus scare over problem client lizard pioneer submit female collect';

// Connect to Ganache
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

async function fetchAccounts() {
  try {
    // Get accounts from Ganache
    const accounts = await web3.eth.getAccounts();

    // Derive private keys from the mnemonic
    const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));
    const wallet_hdpath = "m/44'/60'/0'/0/";

    const accountsData = accounts.map((account, index) => {
      const wallet = hdwallet.derivePath(wallet_hdpath + index).getWallet();
      const privateKey = '0x' + wallet.getPrivateKey().toString('hex');
      return {
        address: account,
        privateKey: privateKey,
      };
    });

    // Save to a file
    fs.writeFileSync(__dirname + '/../config/accounts.json', JSON.stringify(accountsData, null, 2));
    console.log('Accounts saved to accounts.json');
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
}

fetchAccounts();

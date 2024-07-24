// byJBX6
// initially, a script to 'check' the number of txns a wallet has made on the Base Layer-2 Network
// using the 'web3' library to interact with the network
// and the 'dotenv' library to load environment variables from a .env file
// script evolving to check the balance of a wallet on the Base Layer-2 Network

// import the 'web3' library
const Web3 = require('web3');
// import the 'dotenv' library
require('dotenv').config();

// create a new instance of the 'Web3' class
const web3 = new Web3(process.env.PROVIDER_URL);

// Combined ERC20 ABI for balanceOf and name functions
const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "type": "function"
    }
  ];
  
  // List of ERC20 token contract addresses to check
const tokenContracts = [
    "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9", // BaseSwap Token
    "0xd5046b976188eb40f6de40fb527f89c05b323385", // BSX Token
    "0xb8D98a102b0079B69FFbc760C8d857A31653e56e", // Toby Meme Coin
    "0x4ed4e862860bed51a9570b96d89af5e1b0efefed", // Degen Token
    "0xFF0C532FDB8Cd566Ae169C1CB157ff2Bdc83E105", // Frenpet Token (possibly NFT)
    // tokens i dont own but am interested in
    "0x901D6494deAe2407389473CE74fcCc15e5F87cdE", // ? Infusion Protocol
    "0x6059d0ed9368c36941514d2864fD114a84853d5a", // FOAM Protocol Token (Proof of location: provides onchain verified location data over radio)
    "0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85", // SEAMLESS Protocl Token
    "0x2dAD3a13ef0C6366220f989157009e501e7938F8", // EXTRA
    "0x01facC69EC7360640AA5898E852326752801674A", // FUSE Token
    "0xACAd1d3107808577022387C07512E7828694B2a2", // ETHIX, ? scam
    "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe", // HIGHER (lifestyle meme token, looks potentially legit)
    // "0x0", // ? (empty address)
];

// Function to validate environment variables
function validateEnvVars() {
    const requiredVars = ['PROVIDER_URL', 'WALLET_ADDRESS'];
    requiredVars.forEach(variable => {
        if (!process.env[variable]) {
            throw new Error(`Missing required environment variable: ${variable}`);
        }
    });
}

// adding Caching
// Cache object to store token balances
const cache = {};

// define an async function to check the number of transactions made by a wallet
async function getTxnCount() {
    // Best practice to wrap inside try-catch block to catch and handle errors because there are many things that can go wrong...
    try {
        // get the wallet address from the environment variables
        const address = process.env.WALLET_ADDRESS;
        // Validate the wallet address
        if (!web3.utils.isAddress(address)) {
            // Throw a new error if the address is invalid
            throw new Error('Invalid wallet address');
            // No need to return here because the 'throw' keyword will stop the execution of the function
        }
        // get the number of transactions made by the wallet
        const txCount = await web3.eth.getTransactionCount(address);
        // log the number of transactions made by the wallet
        console.log(`The wallet at address ${address} has made ${txCount} transactions.`);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};

// define an async function to check/get the ETH-balance of a wallet on the Base Layer-2 Network
async function getWalletEthBalance() {
    try {
        const address = process.env.WALLET_ADDRESS;
        const balance = await web3.eth.getBalance(address);
        // Convert the balance from wei to ETH
        const ethBalance = web3.utils.fromWei(balance, 'ether');

        // log the output to the console
        console.log(`The balance of the wallet at address ${address} is ${ethBalance} ETH.`);
    } catch (error) {
        console.error(`An error occurred while getting the balance: ${error.message}`);
    }
}

// define an async function to get estimated gas price
async function getEstGasPrice() {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        // convert wei to ETH
        const gasPriceInEth = web3.utils.fromWei(gasPrice, 'ether');
        // log the output to the console
        console.log(`The estimated gas price is ${gasPriceInEth} wei.`);
    } catch (error) {
        console.error(`An error occurred while getting the estimated gas price: ${error.message}`);
    }
}

// define an async function to get the balance of all ERC20 tokens a wallet owns
async function getERC20TokenBalances() {
    const address = process.env.WALLET_ADDRESS;

    // use map to create an array of promises
    const balancePromises = tokenContracts.map(async (tokenAddress) => {
        // Check if the token balance is already cached
        if (cache[tokenAddress]) {
            return cache[tokenAddress];
        }

        // Create a new instance of the ERC20 token contract with combined ABIs
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);

        try {
            // get token name
            const tokenName = await tokenContract.methods.name().call();
            // get balance of token for wallet address
            const balance = await tokenContract.methods.balanceOf(address).call();
            // Conver balance from wei to ETH (readable format)
            const readableBalance = web3.utils.fromWei(balance, "ether");

            // Cache the result for future use
            const result = { tokenName, tokenAddress, readableBalance };
            cache[tokenAddress] = result;

            return result;
            
            // return the result
            // removed post caching implementation
            // return { tokenName, tokenAddress, readableBalance };
        } catch (error) {
            // Return error msg
            return { tokenName: `Error`, tokenAddress, readableBalance: `Could not get balance: ${error.message}` };
        }
    });

    // Wait for all promises to resolve and log results
    const results = await Promise.all(balancePromises);
    results.forEach(({ tokenName, tokenAddress, readableBalance } = results) => {
        console.log(`Balance for token (${tokenName}) at ${tokenAddress}: ${readableBalance}`);
    });
}

// define the 'main' function
async function main() {
    // call the 'getTxnCount' function
    // await getTxnCount();

    // call the 'getWalletEthBalance' function
    // await getWalletEthBalance();

    // call the 'getEstGasPrice' function
    // await getEstGasPrice();

    // wrap in try catch for improved error handling
    try {
        validateEnvVars();
        // get the balance of all ERC20 tokens a wallet owns
        await getERC20TokenBalances();
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

// call the 'main' function
main();
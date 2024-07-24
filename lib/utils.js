// utils.js
// '../lib/utils.js'

const Web3 = require('web3');
// require('dotenv').config();

const PROVIDER_URL = process.env.PROVIDER_URL || "https://mainnet.base.org";
const web3 = new Web3(PROVIDER_URL);

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

  
const defaultTokenContracts = [
    "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9", // BaseSwap Token
    "0xd5046b976188eb40f6de40fb527f89c05b323385", // BSX Token
    "0xb8D98a102b0079B69FFbc760C8d857A31653e56e", // Toby Meme Coin
    "0x4ed4e862860bed51a9570b96d89af5e1b0efefed", // Degen Token
    // "0xFF0C532FDB8Cd566Ae169C1CB157ff2Bdc83E105", // Frenpet Token (possibly NFT)
    // tokens i dont own but am interested in
    "0x901D6494deAe2407389473CE74fcCc15e5F87cdE", // ? Infusion Protocol
    "0x6059d0ed9368c36941514d2864fD114a84853d5a", // FOAM Protocol Token (Proof of location: provides onchain verified location data over radio)
    "0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85", // SEAMLESS Protocl Token
    "0x2dAD3a13ef0C6366220f989157009e501e7938F8", // EXTRA
    "0x01facC69EC7360640AA5898E852326752801674A", // FUSE Token
    "0xACAd1d3107808577022387C07512E7828694B2a2", // ETHIX, ? scam
    "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe", // HIGHER (lifestyle meme token, looks potentially legit)
    // "0x0", // ? (empty address)
];  // List(array) of default/predefined/hard-coded-ERC20 token contract addresses to check balances for

async function getTxnCount(address) {
    if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    return await web3.eth.getTransactionCount(address);
}

async function getWalletEthBalance(address) {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
}

async function getERC20TokenBalances(address, customContracts = []) {
    const allContracts = [...defaultTokenContracts, ...customContracts];
    const balancePromises = allContracts.map(async (tokenAddress) => {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        try {
            const tokenName = await tokenContract.methods.name().call();
            const balance = await tokenContract.methods.balanceOf(address).call();
            const readableBalance = web3.utils.fromWei(balance, 'ether');
            return { tokenName, tokenAddress, readableBalance };
        } catch (error) {
            console.error(`Error fetching balance for ${tokenAddress}:`, error.message);
            return { 
                tokenName: 'Error', 
                tokenAddress, 
                readableBalance: `Could not get balance: ${error.message}` 
            };
        }
    });
    return await Promise.all(balancePromises);
}

// async function to get token names from contract addresses
async function getTokenName(tokenAddress) {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    try {
        return await tokenContract.methods.name().call();
    } catch (error) {
        console.error(`Error fetching token name for ${tokenAddress}:`, error.message);
        return "Unknown Token";
    }
};

// Function to validate environment variables
function validateEnvVars() {
    const requiredVars = ['PROVIDER_URL', 'WALLET_ADDRESS'];
    requiredVars.forEach(variable => {
        if (!process.env[variable]) {
            throw new Error(`Missing required environment variable: ${variable}`);
        }
    });
}

module.exports = { 
    getTxnCount, 
    getWalletEthBalance, 
    getERC20TokenBalances, 
    validateEnvVars, 
    getTokenName 
};

// index.js
require('dotenv').config();

const { getTxnCount, getWalletEthBalance, getERC20TokenBalances } = require('./lib/utils');

async function main() {
    const address = process.env.WALLET_ADDRESS;
    console.log(`Fetching information for wallet: ${address}`);

    try {
        const txCount = await getTxnCount(address);
        console.log(`The wallet has made ${txCount} transactions.`);

        const ethBalance = await getWalletEthBalance(address);
        console.log(`ETH Balance: ${ethBalance} ETH`);

        const tokenBalances = await getERC20TokenBalances(address);
        tokenBalances.forEach(({ tokenName, tokenAddress, readableBalance }) => {
            console.log(`Token (${tokenName}) at ${tokenAddress}: ${readableBalance}`);
        });
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

main();

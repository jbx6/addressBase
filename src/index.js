// index.js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TokenRow } from '@coinbase/onchainkit/token';
import { getWalletEthBalance, getERC20TokenBalances, getTxnCount, getTokenName } from '../lib/utils';
import './index.css';

const WalletInfo = () => {
    const [address, setAddress] = useState(process.env.WALLET_ADDRESS || '');
    const [ethBalance, setEthBalance] = useState(null);
    const [tokenBalances, setTokenBalances] = useState([]);
    const [txnCount, setTxnCount] = useState(null);
    const [error, setError] = useState(null);
    const [contractAddresses, setContractAddresses] = useState('');
    const [customContracts, setCustomContracts] = useState([]);
    const [tokenNames, setTokenNames] = useState({});
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);

    const fetchBalances = async (walletAddress) => {
        try {
            if (!walletAddress) {
                throw new Error("Please enter a wallet address");
            }

            setIsLoadingTokens(true);   // Set loading state
            setError(null);  // Reset error state

            const ethBalance = await getWalletEthBalance(walletAddress);    // Get ETH balance
            setEthBalance(ethBalance);  // Set ETH balance

            const balances = await getERC20TokenBalances(walletAddress, customContracts);   // Get ERC20 token balances
            setTokenBalances(balances); // Set token balances
        } catch (error) {
            console.error("An error occurred while fetching balance(s):", error.message);
            setError(error.message);
        } finally {
            setIsLoadingTokens(false);   // Reset loading state
        }
    };

    const fetchTxnCount = async (walletAddress) => {
        try {
            if (!walletAddress) {
                throw new Error("Please enter a wallet address");
            }

            // Get txn count
            const txnCount = await getTxnCount(walletAddress);
            setTxnCount(txnCount);
        } catch (error) {
            console.error("An error occurred while fetching transaction count:", error.message);
            setError(error.message);
        }
    };

    // Fetch token names
    const fetchTokenNames = async () => {
        const names = {};
        for (const contract of customContracts) {
            try {
                const name = await getTokenName(contract);
                names[contract] = name;
            } catch (error) {
                console.error(`Error fetching token name for ${contract}:`, error.message);
                names[contract] = "Unknown Token";
            }
        }
        setTokenNames(names);
    };

    useEffect(() => {
        if (address) {
            fetchBalances(address);
            fetchTxnCount(address);
        }
    }, [address, customContracts]);

    useEffect(() => {
        if (customContracts.length > 0) {
            fetchTokenNames();
        };
    }, [customContracts]);

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleContractAddressesChange = (e) => {
        setContractAddresses(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchBalances(address);
        fetchTxnCount(address);
    };

    const handleAddContracts = () => {
        const newContracts = contractAddresses.split(',').map(addr => addr.trim()).filter(addr => addr !== '');
        setCustomContracts(prev => [...new Set([...prev, ...newContracts])]);
        setContractAddresses('');
    };

    const handleRemoveContract = (contractToRemove) => {
        setCustomContracts(prev => {
            const updatedContracts = prev.filter(contract => contract !== contractToRemove);
            // Fetch balances again with updated contracts list
            fetchBalances(address);
            return updatedContracts;
        });
        setTokenNames(prev => {
            const { [contractToRemove]: _, ...rest } = prev;
            return rest;
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Wallet Information</h1>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex mb-4">
                    <input
                        type="text"
                        value={address}
                        onChange={handleAddressChange}
                        placeholder="Enter wallet address"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Fetch Balances
                    </button>
                </div>
                <div className="flex mb-4">
                    <input
                        type="text"
                        value={contractAddresses}
                        onChange={handleContractAddressesChange}
                        placeholder="Enter contract addresses (comma-separated)"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="button"
                        onClick={handleAddContracts}
                        className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Add Contracts
                    </button>
                </div>
            </form>
            {customContracts.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Custom Contracts:</h3>
                    <ul className="space-y-2">
                        {customContracts.map((contract, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                <span className="font-mono">
                                    {tokenNames[contract] ? `${tokenNames[contract]} (${contract})` : contract}
                                </span>
                                <button 
                                    onClick={() => handleRemoveContract(contract)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <div className="text-red-500 mb-4">Error: {error}</div>}
            {address && (
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-700">ETH Balance</h2>
                        {ethBalance !== null ? (
                            <p className="text-xl font-mono bg-gray-100 p-3 rounded">{ethBalance} ETH</p>
                        ) : (
                            <p className="text-gray-500">Loading...</p>
                        )}
                    </div>
                    <div className='mb-6'>
                        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Transaction Count</h2>
                        {txnCount !== null ? (
                            <p className="text-xl font-mono bg-gray-100 p-3 rounded">{txnCount}</p>
                        ) : (
                            <p className="text-gray-500">Loading...</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Token Balances</h2>
                        {isLoadingTokens ? (
                            <p className="text-gray-500">Loading token balances...</p>
                        ) : tokenBalances.length > 0 ? (
                            <div className="space-y-2">
                                {tokenBalances.map(({ tokenName, tokenAddress, readableBalance }) => (
                                    <div key={tokenAddress} 
                                        className="bg-gray-100 p-3 rounded flex justify-between items-center"
                                    >
                                        <span className="font-semibold">{tokenName || tokenAddress}</span>
                                        <span className="font-mono">{readableBalance}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No tokens found</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WalletInfo;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <WalletInfo />
    </React.StrictMode>
);
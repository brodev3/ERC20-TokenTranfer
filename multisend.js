const Wallet = require('./wallet');
const utils = require('./utils/utils');
const log = require('./utils/logger');

async function transferNativeTokens(wallet, receiver, amount, gasReserve) {
    try {
        const nativeBalance = await wallet.nativeBalance();
        const amountInEther = ethers.utils.parseEther(amount.toString()); 
        
        if (nativeBalance < amountInEther + gasReserve) {
            log.warn(`Wallet: ${wallet.address}. Insufficient native balance (${nativeBalance} ETH). Needed: ${amountInEther + gasReserve} ETH.`);
            return false; 
        }


        const txReceipt = await wallet.transferNative(receiver, amountInEther);
        log.success(`Wallet: ${wallet.address}. Sent ${amountInEther} ETH to ${receiver}.\nTX Hash: ${txReceipt.transactionHash}`);
        return true; 
    } catch (err) {
        log.error(`Wallet: ${wallet.address}. Failed to send tokens to ${receiver}. Error: ${err.message}\nStack: ${err.stack}`);
        return false; 
    }
}

async function processWallet(wallet, receivers, tokenAmount, gasReserve, lock) {
    while (true) {
        let receiver;

        lock.acquire();
        try {
            if (receivers.length === 0) {
                break; 
            }
            receiver = receivers.shift(); 
        } finally {
            lock.release();
        }

        if (receiver) {
            const success = await transferNativeTokens(wallet, receiver, tokenAmount, gasReserve);
            if (!success) {
                lock.acquire();
                try {
                    receivers.push(receiver); 
                } finally {
                    lock.release();
                }
            }
        }
    }

    log.success(`Wallet ${wallet.address} has completed its transfers.`);
}

class Lock {
    constructor() {
        this._queue = [];
        this._locked = false;
    }

    acquire() {
        return new Promise(resolve => {
            if (!this._locked) {
                this._locked = true;
                resolve();
            } else {
                this._queue.push(resolve);
            }
        });
    }

    release() {
        if (this._queue.length > 0) {
            const next = this._queue.shift();
            next();
        } else {
            this._locked = false;
        }
    }
}

async function main() {
    try {
        const walletData = process.env.DECRYPT ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray("w.csv");
        const receivers = await utils.readCSVToArray('receivers.csv');

        const wallets = walletData.map(row => {
            const privateKey = row;
            return new Wallet(privateKey);
        });

        const tokenAmount = parseFloat(process.env.TOKEN_AMOUNT); 
        const gasReserve = ethers.utils.parseEther(process.env.GAS_RESERVE); 

        const lock = new Lock(); 

        const walletTasks = wallets.map(wallet => processWallet(wallet, receivers, tokenAmount, gasReserve, lock));

        await Promise.all(walletTasks);

        log.success('All wallets have completed their transfers.');
    } catch (err) {
        log.error(`Error in main process. Message: ${err.message}\nStack: ${err.stack}`);
    }
}

main();

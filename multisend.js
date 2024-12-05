require('dotenv').config();
const Wallet = require('./wallet');
const utils = require('./utils/utils');
const log = require('./utils/logger');
const { ethers, parseEther, BigNumber } = require("ethers");

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

async function transferNativeTokens(wallet, receiver, amount, gasReserve) {
    try {
        const nativeBalance = parseEther(await wallet.nativeBalance());
        const amountInEther = parseEther(amount.toString());
        const totalRequired = amountInEther + gasReserve;

        if (nativeBalance <=totalRequired) {
            log.warn(`Wallet: ${wallet.address}. Insufficient native balance (${nativeBalance.toString()} ETH). Needed: ${totalRequired.toString()} ETH.`);
            return false;
        }

        const txReceipt = await wallet.transferNative(receiver, amountInEther);
        log.success(`Wallet: ${wallet.address}. Sent ${amountInEther.toString()} ETH to ${receiver}.\nTX Hash: ${txReceipt.transactionHash}`);
        return true;
    } catch (err) {
        log.error(`Wallet: ${wallet.address}. Failed to send tokens to ${receiver}. Error: ${err.message}\nStack: ${err.stack}`);
        return false;
    }
}

async function processWallet(wallet, receivers, tokenAmount, gasReserve, lock) {
    while (true) {
        let receiver;

        await lock.acquire();
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
                await lock.acquire();
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

async function main() {
    try {
        const walletData = process.env.DECRYPT ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray("w.csv");
        const receivers = await utils.readCSVToArray('receivers.csv');

        const wallets = walletData.map(row => new Wallet(row));
        const tokenAmount = parseFloat(process.env.TOKEN_AMOUNT);
        if (!process.env.GAS_RESERVE) throw new Error("GAS_RESERVE is not defined.");

        const gasReserve = parseEther(process.env.GAS_RESERVE);
        const lock = new Lock();

        const walletTasks = wallets.map(wallet => processWallet(wallet, receivers, tokenAmount, gasReserve, lock));
        await Promise.all(walletTasks);

        log.success('All wallets have completed their transfers.');
    } catch (err) {
        log.error(`Error in main process. Message: ${err.message}\nStack: ${err.stack}`);
    }
}

main();

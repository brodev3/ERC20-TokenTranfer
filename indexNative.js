const Wallet = require('./wallet');
const utils = require('./utils/utils');
const log = require('./utils/logger');
const { parseEther, formatEther } = require("ethers");

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const transferNative = async (wallet) => {
    try {
        const balanceWei = await wallet.nativeBalance();
        const balance = BigInt(parseEther(balanceWei.toString()));

        let gasPrice = BigInt(await wallet.getGasPrice());
        let gasLimit = BigInt(await wallet.estimateGasLimit(wallet.receiver));

        gasPrice = gasPrice * BigInt(20) / BigInt(10);
        gasLimit = gasLimit * BigInt(40) / BigInt(10)
        const totalGasCost = gasPrice * gasLimit;
        const transferableAmount = balance - totalGasCost;

        log.info(`Balance: ${balance}, Gas Price: ${gasPrice}, Gas Limit: ${gasLimit}, Total Gas Cost: ${totalGasCost}, Transferable Amount: ${transferableAmount}`);

        if (transferableAmount > 0) {
            const transferTX = await wallet.transferNative(wallet.receiver, transferableAmount.toString());

            log.success(`Wallet: ${wallet.address}. Transferred native tokens to ${wallet.receiver}!\nTX: ${transferTX.hash}`);
        } else {
            log.warn(`Wallet: ${wallet.address}. Insufficient balance for transfer after gas costs.`);
        }
    } catch (err) {
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
    };
};

async function main() {
    const data = process.env.DECRYPT ? await utils.readDecryptCSVToArray("w.csv") : await utils.readCSVToArray("w.csv");
    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const privateKey = process.env.RECEIVER ? row : row.split(";")[0];
        const receiver = process.env.RECEIVER ? process.env.RECEIVER : row.split(";")[1];

        const wallet = new Wallet(privateKey, receiver);
        const delay = randomDelay(1_000, process.env.MAXTIME);
        setTimeout(transferNative, delay, wallet);
    };
};

main(); 
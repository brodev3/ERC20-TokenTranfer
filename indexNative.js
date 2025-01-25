const Wallet = require('./wallet');
const utils = require('./utils/utils');
const log = require('./utils/logger');
const { parseEther } = require("ethers");

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const transferNative = async (wallet) => {
    try {
        const balance = BigInt(parseEther(await wallet.nativeBalance()));
        const gasPrice = BigInt(await wallet.getGasPrice());
        const gasLimit = BigInt(await wallet.estimateGasLimit(wallet.receiver));

        const totalGasCost = gasPrice * gasLimit;
        const transferableAmount = balance - totalGasCost;

        if (transferableAmount > 0) {
            const transferTX = await wallet.transferNative(wallet.receiver, transferableAmount.toString(), gasPrice, gasLimit);

            log.success(`Wallet: ${wallet.address}. Transferred native tokens to ${wallet.receiver}!\nTX: ${transferTX.hash}`);
        } else {
            log.warn(`Wallet: ${wallet.address}. Insufficient balance for transfer after gas costs.`);
        }
    } catch (err) {
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
    };
};

async function main() {
    const data = process.env.DECRYPT ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray();
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
const Wallet = require('./wallet');
const utils = require('./utils/utils');
const log = require('./utils/logger');

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const transfer = async (wallet) => {
    try {
        const balance = await wallet.balance();
        const transferTX = await wallet.transfer(wallet.receiver, balance);

        log.success(`Wallet: ${wallet.address}. Transfered all tokens to ${wallet.receiver}!\nTX: ${transferTX.hash}`);

    }
    catch (err){
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
    };
};

async function main() {
    const data = process.env.DECRYPT ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray();
    for (let index =  0; index < data.length; index++) {
        const row = data[index];
        const privateKey = process.env.RECEIVER ? row : row.split(";")[0];
        const receiver = process.env.RECEIVER ? process.env.RECEIVER : row.split(";")[1];

        const wallet = new Wallet(privateKey, receiver);
        const delay = randomDelay(0, 1_000);
        setTimeout(transfer, delay, wallet);
    };
};

main();

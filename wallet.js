const utils = require('./utils/utils');
const log = require('./utils/logger')
const { ethers, formatEther, parseEther } = require("ethers");
const contractABI = require('./ABI.json');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

class Wallet {

    constructor(privateKey, receiver) {
        this.receiver = receiver;
        this.chainConnect = new ethers.Wallet(privateKey, provider);

        this.address = this.chainConnect.address;
        this.privateKey = this.chainConnect.privateKey;

        this.contract = new ethers.Contract(process.env.CONTRACT, contractABI, this.chainConnect);

    };

    async balance(){
        try {
            const balance = await this.contract.balanceOf(this.address);
            return balance;
        } catch (error) {
            log.error(`Call balanceOf. Error message: ${error.message}\nStack: ${error.stack}`);
            throw error;
        };
    };

    async transfer(receiver, amount){
        try {
            const tx = await this.contract.transfer(receiver, amount);    
            const receipt = await tx.wait();
            return tx;
        } catch (error) {
            log.error(
                `Wallet: ${this.address}. Transfer error. Message: ${error.message}\nStack: ${error.stack}
                Transaction: ${error.transaction}\nTransactionHash: ${error.transactionHash}\nTransactionHash: ${error.receipt}`
            );
            throw error;
        };
    };

    async nativeBalance() {
        try {
            const balance = await provider.getBalance(this.address);
            return formatEther(balance); // Returns balance in Ether
        } catch (error) {
            log.error(`Failed to fetch native token balance. Error message: ${error.message}\nStack: ${error.stack}`);
            throw error;
        };
    };

    async transferNative(receiver, amount, gasPrice = null, gasLimit = null) {
        try {
            const transaction = {
                to: receiver,
                value: amount,
                gasPrice: gasPrice,
                gasLimit: gasLimit
            };

            const tx = await this.chainConnect.sendTransaction(transaction);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            log.error(
                `Wallet: ${this.address}. Native token transfer error. Message: ${error.message}\nStack: ${error.stack}`
            );
            throw error;
        }
    };

    async getGasPrice() {
        try {
            const gasPrice = await provider.send("eth_gasPrice", []);
            return gasPrice;
        } catch (error) {
            log.error(`Failed to fetch gas price. Error message: ${error.message}\nStack: ${error.stack}`);
            throw error;
        }
    }

    async estimateGasLimit(receiver) {
        try {
            const gasLimit = await provider.estimateGas({
                to: receiver,
                from: this.address
            });
            return gasLimit;
        } catch (error) {
            log.error(`Failed to estimate gas limit. Error message: ${error.message}\nStack: ${error.stack}`);
            throw error;
        }
    }
    
};



module.exports = Wallet;
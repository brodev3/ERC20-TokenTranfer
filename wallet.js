const utils = require('./utils/utils');
const log = require('./utils/logger')
const { ethers } = require("ethers");
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
            return ethers.utils.formatEther(balance); // Returns balance in Ether
        } catch (error) {
            log.error(`Failed to fetch native token balance. Error message: ${error.message}\nStack: ${error.stack}`);
            throw error;
        };
    };

    async transferNative(receiver, amount) {
        try {
            const tx = await this.chainConnect.sendTransaction({
                to: receiver,
                value: ethers.utils.parseEther(amount.toString()), // Converts amount to Wei
            });
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            log.error(
                `Wallet: ${this.address}. Native token transfer error. Message: ${error.message}\nStack: ${error.stack}
                Transaction: ${error.transaction}\nTransactionHash: ${error.transactionHash}`
            );
            throw error;
        };
    };
    
};



module.exports = Wallet;
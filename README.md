# ERC-20 Token Transfer Tool

<p>
      <img src="https://i.ibb.co/3sHQCSp/av.jpg" >
</p>

<p >
   <img src="https://img.shields.io/badge/build-v_1.0-brightgreen?label=Version" alt="Version">
</p>


## About

This tool allows you to send all ERC-20 tokens to a specified address. You can use it to transfer tokens from different wallets to a single address or multiple addresses.


## Features
- Supports all ERC-20 standard tokens.
- You can input the contract address and ABI if it is an ERC-20 token.
- Works with any network; just specify the correct RPC URL.
- Transfer tokens from multiple wallets to one or different addresses.

 ## Configuration
 Before starting, you need to configure the ```.env``` file. Open ```.env``` and set the following parameters:
 
    
    DECRYPT = 
    MESSAGE = "Sup bro"
    RPC_URL = "https://mainnet.base.org"
    CONTRACT = "0x0000000000000000000000000000000000000000"
    RECEIVER = "0x0000000000000000000000000000000000000000"
    
Explanation of parameters:
- **DECRYPT**: Used for encrypted text. If not needed, leave it empty. If needed, set to ```1```.
- **MESSAGE**: A phrase for decryption.
- **RPC_URL**: The RPC URL of the token's network.
- **CONTRACT**: The ERC-20 token contract address.
- **RECEIVER**: The default recipient for all wallets. Leave empty if sending to different addresses per wallet.

 ### ABI Configuration (Optional)
You can add the ABI of the token to the ```ABI.json``` file if necessary. By default, the software uses the standard ERC-20 ABI, so it's not required to provide a custom ABI unless the token has additional functionality or non-standard methods.

 ## Wallet Configuration
Fill out the ```w.csv``` file with the wallets to be used for token transfers. The first row with the value ```1``` is a header and must not be removed. Below the header, insert data in the format:

    privateKey;recipientAddress

 ## How to Start

1. Node JS
2. Clone the repository to your disk
3. Configure ```.env``` with the appropriate parameters
4. Add wallet information to ```w.csv```
5. Launch the console (for example, Windows PowerShell)
6. Specify the working directory where you have uploaded the repository in the console using the CD command
    ```
    cd C:\Program Files\brothers
    ```
7. Install packages
   
    ```
    npm install
    ```
8. Run the software, and it will transfer tokens from the specified wallets to the respective addresses.: 
    ```
    node index
    ```





## License

Project **brodev3**/ERC-20 Token Transfer Toolis distributed under the MIT license.

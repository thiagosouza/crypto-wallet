import { Web3, Web3BaseWalletAccount } from "web3";
import { Web3Account } from "web3-eth-accounts";
// let accounts = new Web3().eth.accounts;
let accounts = new Web3('https://rpc.sepolia.org').eth.accounts;


export class EthereumService {
    static getAddress = (privateKey: Buffer): string => {

        // let paymentFunctionResult: IPayment | null = null; //| Account;
        
        let account = accounts.privateKeyToAccount(privateKey);

        // let ec: ECPairInterface = ECPairFactory(ecc as TinySecp256k1Interface).fromPrivateKey(derivedPath.privateKey!);
        // console.log(privateKey, "private ", `0x${ec.privateKey?.toString('hex')}`);
        // console.log(publicKey, "public ", `0x${ec.publicKey?.toString('hex')}`);

        if(!account)
            throw new Error(`Error creating address from privateKey ${privateKey}`);
        return account.address
    }
}
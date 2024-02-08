import { AddressTypes } from "./interfaces";
import { Network, networks, payments, Payment } from "bitcoinjs-lib";

// interface BitcoinWallet {
//     publicKey: string
//     addressType: string
// }

interface IPayment extends Payment {
    privateKey?: string
}

export class BitcoinService {
    static getAddress = (pubkey: Buffer, addressType: AddressTypes, network: Network = networks.bitcoin): string => {

        let paymentFunctionResult: IPayment | null = null; //| Account;

        switch (addressType) {
            case AddressTypes.BitcoinLegacy: //1
                paymentFunctionResult = payments.p2pkh({network, pubkey})
                break;
            case AddressTypes.NativeSegWitMultisig:
                let p2wsh = payments.p2wsh({ pubkey, network })
                paymentFunctionResult = payments.p2sh({ redeem: p2wsh, network })
                break;
            case AddressTypes.SegWit: //3
                paymentFunctionResult = payments.p2sh({ redeem: payments.p2wpkh({ pubkey, network }) })
                break;
            case AddressTypes.NativeSegWit: //bc1
                paymentFunctionResult = payments.p2wpkh({ network, pubkey })
                // https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch06.asciidoc#pay-to-public-key-hash-p2pkh
                break;
            default:
                throw new Error(`Wrong address type: ${addressType}`)
        }

        if(!paymentFunctionResult.address)
            throw new Error(`Error creating address for pubkey ${pubkey} at ${network} network`);

        return paymentFunctionResult.address
    }
}
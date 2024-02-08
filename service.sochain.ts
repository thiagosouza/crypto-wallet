import { networks } from "bitcoinjs-lib";
import axios from "axios";

// p2pkh explained here https://learnmeabitcoin.com/technical/p2pkh
// base 58 explained here https://learnmeabitcoin.com/technical/base58
// https://learnmeabitcoin.com/technical/mnemonic
// references: https://flawsomedev.com/posts/bitcoin-wallet-simple/

export interface SochainResponseDataFail {
  "status": "fail"
  "data": {
    "network": String
    "address": String
    "after_tx": String
  }
}

export interface SochainResponseDataSuccess {
  "status": "success",
  "data": {
    "network": String,
    "address": String,
    "txs": {
      "txid": String,
      "output_no": number,
      "script_asm": String,
      "script_hex": String,
      "value": String,
      "confirmations": number,
      "time": number
    }[]
  }
}

export class Sochain {

  // https://sochain.com/api/#get-unspent-tx
  public static async getTXUnspent(address: string): Promise<SochainResponseDataSuccess | SochainResponseDataFail | null> {
    try {
      console.log(`address https://sochain.com/api/v2/get_tx_unspent/BTC/${address}`);
      const response = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/BTC/${address}`);

      // console.log(response.data.data.txs);
      // return;

      if (response.data?.status == "success")
        return response.data satisfies SochainResponseDataSuccess;

      // return response.data satisfies SochainResponseDataFail;
      return null

    } catch (error) {
      console.error(error)
      // return { status: "fail", data: {} } as 
      return null
    }
  };

}


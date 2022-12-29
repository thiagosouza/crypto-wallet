import {
  BIP32Factory,
  TinySecp256k1Interface as TinySecp256k1Interface_BIP32,
} from "bip32";

import {
  ECPairAPI,
  ECPairFactory,
  ECPairInterface,
  TinySecp256k1Interface,
} from "ecpair";

import * as ecc from "tiny-secp256k1";

import { keccak_256, } from "js-sha3" //ethereum uses it

import {
  mnemonicToSeed,
  generateMnemonic,
  entropyToMnemonic,
  setDefaultWordlist,
  getDefaultWordlist,
  wordlists,
} from "bip39";

import { Network, networks, Payment, payments, Psbt } from "bitcoinjs-lib";

// import { createHash } from "crypto";

import axios from "axios";

// import { Eth } from "web3-eth";
import Web3 from "web3";
import { walletParams, AddressTypes, BIPs, HDWallet, CoinTypes, Wallet } from "./interfaces";
let eth = new Web3().eth;

export async function createHDWallet(params: walletParams = {
  showPrivateKeys: false,
  addressType: AddressTypes.NativeSegWit,
  bip: BIPs.BIP84
}): Promise<HDWallet | null> {

  let { network, derivationPath, coinType, mnemonic, bip, addressType, showPrivateKeys } = params;
  let metadata: any;

  if (!coinType) coinType = CoinTypes.Bitcoin;

  if (!mnemonic) mnemonic = generateMnemonic();

  if (!mnemonic) {
    throw new Error("Mnemonic is required");
  }

  if (!new RegExp(`m\/${bip}'?\/`).test(derivationPath!)) {
    throw new Error(`Derivation Path ${derivationPath} is wrong compared to bip ${bip}`);
  }

  const seed = await mnemonicToSeed(mnemonic);

  // Secp256k1 is the name of the elliptic curve used by Bitcoin to implement its public key cryptography. 
  // All points on this curve are valid Bitcoin public keys.
  // Secp256k1 - https://river.com/learn/terms/s/secp256k1/
  // Elliptic Curve Digital Signature Algorithm - https://learnmeabitcoin.com/technical/ecdsa
  const root = BIP32Factory(ecc as TinySecp256k1Interface_BIP32).fromSeed(seed, network);

  let HDWallet: HDWallet = {
    wallets: [],
    mnemonic: mnemonic,
    seed: seed.toString("hex"),
    root,
    account: root.derivePath(derivationPath?.replace(/(?<account>m\/\d+'?\/\d+'?\/\d+'?).*/, "$1")!), // https://regex101.com/r/lyJ63Z/1
    metadata
  } as HDWallet;

  if (!bip) {
    throw new Error(`List of BIPs must not to be undefined`)
  }

  for (let i: number = 0; i < 3; i++) {
    let metadata = {};
    const derivationPathDeafult = `m/${bip}'/${coinType}'/0'/0`;
    const derivedPath = root.derivePath(derivationPath || derivationPathDeafult).derive(i);

    let pubkey = derivedPath.publicKey;

    let privateKey: string = derivedPath.toWIF();
    let publicKey: string = derivedPath.publicKey.toString("hex");
    let address: string;

    interface IPayment extends Payment {
      privateKey?: string
    }
    let paymentFunctionResult: IPayment | null = null; //| Account;

    if (bip == BIPs.BIP44 && addressType == AddressTypes.BitcoinLegacy && coinType == CoinTypes.Bitcoin) {
      paymentFunctionResult = paymentFunction(payments.p2pkh, network, pubkey);
    }
    else if (bip == BIPs.BIP49 && addressType == AddressTypes.SegWit && coinType == CoinTypes.Bitcoin) {
      paymentFunctionResult = payments.p2sh({ redeem: payments.p2wpkh({ pubkey, network }), network });
    }
    else if (bip == BIPs.BIP84 && addressType == AddressTypes.NativeSegWit && coinType == CoinTypes.Bitcoin) {
      paymentFunctionResult = payments.p2wpkh({ network, pubkey });
    }
    else if (coinType == CoinTypes.Ethereum) {
      paymentFunctionResult = eth.accounts.privateKeyToAccount(
        derivedPath.privateKey!.toString("hex")
      );
      publicKey = `0x${publicKey}`;
      privateKey = paymentFunctionResult.privateKey!;

      let ec: ECPairInterface = ECPairFactory(ecc as TinySecp256k1Interface).fromPrivateKey(derivedPath.privateKey!);
      // console.log(privateKey, "private ", `0x${ec.privateKey?.toString('hex')}`);
      // console.log(publicKey, "public ", `0x${ec.publicKey?.toString('hex')}`);
    }
    else if (bip === BIPs.BIP44) {
      paymentFunctionResult = payments.p2pkh({ network, pubkey });
    }

    if (!paymentFunctionResult)
      throw new Error(`Payment type does not match for bip ${bip} and addressType ${addressType}`)

    address = paymentFunctionResult.address || "";

    if (!address) {
      throw new Error(`Missing address`)
    }

    let wallet = {
      derivedPath: `${derivationPath}/${i}`,
      address,
      publicKey,
      ...(showPrivateKeys ?? false ? { privateKey } : {}),
      metadata,
    } as Wallet;
    // console.log(wallet);
    HDWallet.wallets.push(wallet);
  }

  return HDWallet as HDWallet;
}


// p2pkh explained here https://learnmeabitcoin.com/technical/p2pkh
// base 58 explained here https://learnmeabitcoin.com/technical/base58
// https://learnmeabitcoin.com/technical/mnemonic
// references: https://flawsomedev.com/posts/bitcoin-wallet-simple/

export const getTXUnspent = async (address: string) => {
  return axios
    .get(
      `https://sochain.com/api/v2/get_tx_unspent/${networks.bitcoin}/${address}`
    ).then(response => response.data.data)
    .catch((error) => {
      console.log(error);
      return { data: { data: null } };
    });
}
function paymentFunction(paymentFunction: any, network: Network | undefined, pubkey: Buffer) {
  return paymentFunction({ network, pubkey }) as Payment;
}


import {
  BIP32Factory,
  BIP32Interface,
  TinySecp256k1Interface,
} from "bip32";

// import {
//   TinySecp256k1Interface,
// } from "ecpair";

import * as ecc from "tiny-secp256k1";

import { keccak_256,  } from "js-sha3" //ethereum uses it

import {
  mnemonicToSeed,
  generateMnemonic,
  entropyToMnemonic,
  setDefaultWordlist,
  getDefaultWordlist,
  wordlists,
} from "bip39";

import { Network, networks, payments, Psbt } from "bitcoinjs-lib";

// import { createHash } from "crypto";

import axios from "axios";

import Web3 from "web3";
let eth = new Web3().eth;

export interface HDWallet {
  mnemonic: string;
  seed: string;
  root: BIP32Interface;
  account: BIP32Interface;
  wallets: Wallet[];
  metadata: { [key: string]: any };
}

export interface Wallet {
  derivedPath: string;
  address: string;
  publicKey: string;
  privateKey: string;
  metadata: { [key: string]: any };
}

interface walletParams {
  derivationPath?: string;
  coinType?: CoinTypes;
  network?: Network;
  mnemonic?: string;
  bip: BIPs;
  addressType: AddressTypes
}

export enum BIPs {
  BIP32 = 32, // deprecated
  BIP44 = 44,
  BIP49 = 49,
  BIP84 = 84,
}

//https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export enum CoinTypes {
  Bitcoin = "0",
  Ethereum = "60",
  DogeCoin = "3"
}

export enum AddressTypes {
  BitcoinLegacy = "BitcoinLegacy",
  SegWit = "SegWit",
  NativeSegWit = "NativeSegWit",
}

export enum DerivationPaths {
  LEDGER = `m/84'/0'/0'/0`
}

// bip 44 derivation path : `m/44'/0'/0'/0` => m / purpose' / coin_type' / account' / change / address_index
// bip 32 derivation path : `m/32'/0'/0` =>    m /                         account' / change'/ address_index

export async function createHDWallet(params: walletParams): Promise<HDWallet | null> {

  let { network, derivationPath, coinType, mnemonic, bip, addressType } = params;
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
  const root = BIP32Factory(ecc as TinySecp256k1Interface).fromSeed(seed, network);
console.log(root)
  let root2 = keccak_256(seed)
  console.log(root2)




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

  for (let i: number = 0; i < 6; i++) {
    let metadata = {};
    const derivationPathDeafult = `m/${bip}'/${coinType}'/0'/0`;
    const derivedPath = root.derivePath(derivationPath || derivationPathDeafult).derive(i);

    let pubkey = derivedPath.publicKey;

    let privateKey: string = derivedPath.toWIF();
    let publicKey: string = derivedPath.publicKey.toString("hex");
    let address: string;

    let paymentFunctionResult = null;

    if (bip == BIPs.BIP44 && addressType == AddressTypes.BitcoinLegacy && coinType == CoinTypes.Bitcoin) {
      paymentFunctionResult = payments.p2pkh({ network, pubkey });
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
      privateKey = paymentFunctionResult.privateKey;
    }
    else if (bip == BIPs.BIP44) {
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
      privateKey,
      metadata,
    } as Wallet;

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

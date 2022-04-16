import {
  BIP32Factory,
  /* TinySecp256k1Interface, */ BIP32API,
  BIP32Interface,
} from "bip32";
import * as ecc from "tiny-secp256k1";
import {
  mnemonicToSeed,
  generateMnemonic,
  entropyToMnemonic,
  setDefaultWordlist,
  getDefaultWordlist,
  wordlists,
} from "bip39";
import { Network, networks, payments, Psbt } from "bitcoinjs-lib";
import { p2pkh } from "bitcoinjs-lib/src/payments";
// import { bitcoin } from "bitcoinjs-lib/src/networks";
import {
  Signer,
  SignerAsync,
  ECPairInterface,
  ECPairFactory,
  ECPairAPI,
  TinySecp256k1Interface,
} from "ecpair";
import * as assert from "assert";
import { createHash } from "crypto";

import { bech32 } from "bech32";
import { toBech32 } from "bitcoinjs-lib/src/address";
import { bitcoin } from "bitcoinjs-lib/src/networks";
import axios from "axios";
import { type } from "os";

// import { assert } from "console";

// setDefaultWordlist("english");
// console.log(getDefaultWordlist())
// console.log(Object.keys(wordlists));

/**
 * HD Wallet Structure
 * Seed -> Master Extended Key -> Purpose -> Network -> Wallet Account -> Receive Path -> Address
 *
 * Seed = mnemonic phrase (12 / 24 words)
 * Master Extended Key = m
 * Purpose = m/0'/
 * Mainnet = m/0'/0'/
 * Wallet Account = m/0'/0'/0'/
 * Receive Path = m/0'/0'/0'/0 .. m/0'/0'/0'/1 ... m/0'/0'/0'/n
 * Address = m/0'/0'/0'/0/0 .. m/0'/0'/0'/0/1 ... m/0'/0'/0'/0/n
 *
 * BIP49 for Bitcoin = m/49'/0'/0'/
 * BIP49 for Bitcoin Testnet= m/49'/1'/0'/
 *
 * reference: https://river.com/learn/terms/h/hd-wallet/
 * https://www.ledger.com/academy/difference-between-segwit-and-native-segwit
 */

export interface HDWallet {
  mnemonic: string;
  seed: string;
  root: BIP32Interface;
  wallets: Wallet[]
}

export interface Wallet {
  derivedPath: string;
  address: string;
  publicKey: string;
  privateKey: string;
}

// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
// const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
// const ECPair: ECPairAPI = ECPairFactory(tinysecp);
// console.log(ECPair)

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

export async function createHDWallet(
  params: walletParams = {
    network: networks.bitcoin,
    mnemonic: generateMnemonic(),
    bip: BIPs.BIP84,
    coinType: CoinTypes.Bitcoin,
    addressType: AddressTypes.NativeSegWit
  }
): Promise<HDWallet | null> {

  let { network, derivationPath, coinType, mnemonic, bip, addressType } = params;

  if (!coinType) coinType = CoinTypes.Bitcoin;

  if(!mnemonic) mnemonic = generateMnemonic();

  if (!mnemonic) {
    throw new Error("Mnemonic is required");
  }

  if (!new RegExp(`m\/${bip}\'\/`).test(derivationPath!)) {
    throw new Error(`Derivation Path ${derivationPath} is wrong compared to bip ${bip}`);
  }

  const seed = await mnemonicToSeed(mnemonic);

  const root = BIP32Factory(ecc).fromSeed(seed, network);

  let HDWallet: HDWallet = {
    wallets: [],
    mnemonic: mnemonic,
    seed: seed.toString("hex"),
    root
  } as HDWallet;

  if (!bip) {
    throw new Error(`List of BIPs must not to be undefined`)
  }

  for (let i: number = 0; i < 3; i++) {
    const derivationPath = `m/${bip}'/${coinType}'/0'/0`;
    const derivedPath = root.derivePath(derivationPath).derive(i);

    console.log(derivedPath.publicKey);

    let pubkey = (coinType == CoinTypes.Ethereum)
      ? Buffer.from(`0x${derivedPath.publicKey.toString("hex")}`, "hex")
      : derivedPath.publicKey;

    console.log(pubkey);

    let paymentFunctionResult = null;

    if (bip == BIPs.BIP44 && addressType == AddressTypes.BitcoinLegacy)
      paymentFunctionResult = payments.p2pkh({ network, pubkey });

    if (bip == BIPs.BIP49 && addressType == AddressTypes.SegWit)
      paymentFunctionResult = payments.p2sh({ redeem: payments.p2wpkh({ pubkey, network }), network });

    if (bip == BIPs.BIP84 && addressType == AddressTypes.NativeSegWit)
      paymentFunctionResult = payments.p2wpkh({ network, pubkey });

    if (!paymentFunctionResult)
      throw new Error(`Payment type does not match for bip ${bip} and addressType ${addressType}`)

    let { address } = paymentFunctionResult;

    let wallet = {
      derivedPath: `${derivationPath}/${i}`,
      address: (coinType == CoinTypes.Ethereum) ? `0x${address}` : address,
      publicKey: derivedPath.publicKey.toString("hex"),
      privateKey: derivedPath.toWIF(),
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

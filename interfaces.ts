import { BIP32Interface } from "bip32";
import { Network } from "bitcoinjs-lib";

export interface MultiAccountHDWallet extends HDWallet {
}

export interface HDWallet {
  mnemonic: string;
  seed: string;
  fingerprint: string;
  root: BIP32Interface;
  account: BIP32Interface;
  wallets: Wallet[];
  metadata: { [key: string]: any; };
}

export interface Wallet {
  derivedPath: string;
  address: string;
  publicKey: string;
  privateKey: string;
  metadata: { [key: string]: any; };
}

export interface walletParams {
  derivationPath?: DerivationPaths;
  coinType?: CoinTypes;
  network?: Network;
  mnemonic?: string;
  bip: BIPs;
  addressType: AddressTypes;
  showPrivateKeys: boolean;
  password?: string;
}

export enum BIPs {
  BIP32 = 32,
  BIP44 = 44, 
  BIP49 = 49,
  BIP84 = 84 
}


// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export enum CoinTypes {
  Bitcoin = "0",
  Ethereum = "60",
  DogeCoin = "3"
}

export enum AddressTypes {
  BitcoinLegacy = "BitcoinLegacy",
  SegWit = "SegWit",
  NativeSegWit = "NativeSegWit"
}
// bip 32 derivation path : `m/0'/0'/0 =>      m  /                        account' / change'/ address_index
// bip 44 derivation path : `m/84'/2'/0'/0` => m / purpose' / coin_type' / account' / change / address_index

export enum DerivationPaths {
  BIP32 = `m/0'/0'`,
  BTC_BIP44 = `m/44'/0'/0'/0`,
  BTC_BIP49 = `m/49'/0'/0'/0`,
  BTC_BIP84 = `m/84'/0'/0'/0`,
  BTC_LEDGER = `m/84'/0'/0'/0`,
  ETH_BIP44 = `m/44'/60'/0'/0`,
  ETH_BIP84 = `m/84'/60'/0'/0`
}

export const walletParamsDefaults: {
  bip44: walletParams;
  bip84: walletParams;
} = {
  bip44: {
    derivationPath: DerivationPaths.BTC_BIP44,
    coinType: CoinTypes.Bitcoin,
    bip: BIPs.BIP44,
    addressType: AddressTypes.BitcoinLegacy,
    showPrivateKeys: false
  },
  bip84: {
    derivationPath: DerivationPaths.BTC_BIP84,
    coinType: CoinTypes.Bitcoin,
    bip: BIPs.BIP84,
    addressType: AddressTypes.NativeSegWit,
    showPrivateKeys: false
  }
};

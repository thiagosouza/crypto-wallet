import {
    BIP32Factory,
    TinySecp256k1Interface as TinySecp256k1Interface_BIP32,
  } from "bip32";
  
  import { BitcoinService } from './bitcoin.service';
  import { EthereumService } from './ethereum.service';
  
  import * as ecc from "tiny-secp256k1";
  
  import * as web3Solana from "@solana/web3.js";
  
  
  import {
    mnemonicToSeed,
    generateMnemonic,
    validateMnemonic,
  } from "bip39"
  
  import { networks } from "bitcoinjs-lib"
  
  import { walletParams, AddressTypes, BIPs, HDWallet, CoinTypes, Wallet, DerivationPaths } from "./interfaces"
  
  
  export async function createHDWallet(params: walletParams = {
    showPrivateKeys: false,
    bip: BIPs.BIP84
  }): Promise<HDWallet | null> {
  
    let { network, derivationPath, coinType, mnemonic, bip, addressType, showPrivateKeys, password } = params;
    let metadata: any;
  
    if(!mnemonic) throw new Error("missing mnemonic");
    if(!derivationPath) throw new Error("missing derivation path");
  
    const seed = (password) ? await mnemonicToSeed(mnemonic, password) : await mnemonicToSeed(mnemonic);
  
    const root = BIP32Factory(ecc as TinySecp256k1Interface_BIP32).fromSeed(seed, network);
  
    const fingerprint = root.fingerprint.toString('hex');
  
    let HDWallet: HDWallet = {
      wallets: [],
      mnemonic,
      ...(password ? { password } : {}),
      seed: seed.toString("hex"),
      fingerprint,
      root
    } as HDWallet;

  
    for (let i: number = 0; i < 20; i++) {
      let metadata = {};
      const derivedPath = root.derivePath(derivationPath).derive(i);
  
      let privateKey: string | Buffer = derivedPath.privateKey!;
      let publicKey: string = derivedPath.publicKey.toString("hex");
  
      let address: string | undefined;
      switch (coinType) {
        case CoinTypes.Bitcoin:
          if(!addressType) throw new Error(`Missing address type`)
          address = BitcoinService.getAddress(derivedPath.publicKey, addressType, networks.bitcoin);
          privateKey = derivedPath.toWIF();
          break;
        case CoinTypes.Ethereum:
          if (!derivedPath.privateKey)
            throw new Error(`Missing private key for derivation path ${derivationPath}`)
          address = EthereumService.getAddress(derivedPath.privateKey);
          publicKey = `0x${publicKey}`;
          break
        case CoinTypes.Solana:
          address = new web3Solana.PublicKey(publicKey).toBase58();
          console.error("sol address",address);
        default:
          break;
      }
  
      if (!address) throw new Error(`Missing address`);
  
      let wallet = {
        derivedPath: `${derivationPath}/${i}`,
        address,
        publicKey,
        ...(showPrivateKeys ?? false ? { privateKey } : {}),
        metadata,
      } as Wallet;
  
      HDWallet.wallets.push(wallet);
    }
  
    return HDWallet as HDWallet;
  }

  createHDWallet({
    mnemonic: "unlock dice whisper juice rather bomb toe demand novel usual glass blush",
    derivationPath: DerivationPaths.BTC_BIP84,
    bip: BIPs.BIP84,
    coinType: CoinTypes.Bitcoin,
    showPrivateKeys: false,
    addressType: AddressTypes.NativeSegWit
  }).then(wallet=>{
    console.log(wallet)
  })
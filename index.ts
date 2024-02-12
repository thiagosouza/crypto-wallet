import {
  BIP32Factory,
  TinySecp256k1Interface as TinySecp256k1Interface_BIP32,
} from "bip32";

import { BitcoinService } from './bitcoin.service';
import { EthereumService } from './ethereum.service';

import * as ecc from "tiny-secp256k1";

import * as web3Solana from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";

// let keypair = Keypair.generate();
// console.log(keypair.publicKey)
// console.log(keypair.secretKey)



import {
  mnemonicToSeed,
  generateMnemonic,
  validateMnemonic,
} from "bip39"

import { networks } from "bitcoinjs-lib"

import { walletParams, AddressTypes, BIPs, HDWallet, CoinTypes, Wallet } from "./interfaces"


export async function createHDWallet(params: walletParams = {
  showPrivateKeys: false,
  bip: BIPs.BIP84
}): Promise<HDWallet | null> {

  let { network, derivationPath, coinType, mnemonic, bip, addressType, showPrivateKeys, password } = params;
  let metadata: any;

  if (!derivationPath) throw new Error("Derivation path is required");
  if (!coinType) coinType = CoinTypes.Bitcoin;

  if (!mnemonic) mnemonic = generateMnemonic();
  if (!mnemonic) throw new Error("Mnemonic is required");

  if (!validateMnemonic(mnemonic)) throw new Error('Mnemonic not valid')

  if (!new RegExp(`m\/${bip}'?\/`).test(derivationPath!))
    throw new Error(`Derivation Path ${derivationPath} is wrong compared to bip ${bip}`);

  const seed = (password) ? await mnemonicToSeed(mnemonic, password) : await mnemonicToSeed(mnemonic);

  const root = BIP32Factory(ecc as TinySecp256k1Interface_BIP32).fromSeed(seed);
  // const root = BIP32Factory(ecc as TinySecp256k1Interface_BIP32).fromSeed(seed, network);
  const rootPassword = BIP32Factory(ecc as TinySecp256k1Interface_BIP32).fromSeed(seed, network);

  const fingerprint = root.fingerprint.toString('hex');

  let HDWallet: HDWallet = {
    wallets: [],
    mnemonic,
    ...(password ? { password } : {}),
    seed: seed.toString("hex"),
    fingerprint,
    root,
    account: root.derivePath(derivationPath?.replace(/(?<account>m\/\d+'?\/\d+'?\/\d+'?).*/, "$1")!), // https://regex101.com/r/lyJ63Z/1
    metadata
  } as HDWallet;

  if (!bip)
    throw new Error(`List of BIPs must not to be undefined`)
  
  let publicKeySolana;


  let address: string | undefined;
  let privateKey: string | Buffer;
  let publicKey: string;
  // let metadata = {};

  if(coinType === CoinTypes.Solana){
    
      const solanaDerivationPaths = [
        "m/44'/501'", 
        "m/44'/501'/0'", 
        "m/44'/501'/0'/0'", 
        "m/44'/501'/0'/0'/0'"
      ];

      for(const derivationPath of solanaDerivationPaths){

        const derivedPath = root.derivePath(derivationPath);
    
        privateKey = derivedPath.privateKey!;
        publicKey = derivedPath.publicKey.toString("hex");

        if(!root.privateKey) throw new Error("erro");
        if(!derivedPath.privateKey) throw new Error("erro");

        let publicKeySolana2 = Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey.toBase58()
        //publicKeySolana = web3Solana.Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey.toString();
        publicKeySolana = web3Solana.Keypair.fromSeed(Uint8Array.from(derivedPath.privateKey)).publicKey.toString();
        // let address = new web3Solana.PublicKey(publicKeySolana).toBase58();
        // let address2 = web3Solana.PublicKey.createProgramAddressSync([Uint8Array.from(privateKey)], web3Solana.Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey);
        // let address2 = web3Solana.PublicKey.createWithSeed();
        console.log("solanaaaaaa", derivationPath, publicKeySolana, publicKeySolana2);

        // let address2 = web3Solana.PublicKey.createProgramAddressSync([Keypair.fromSeed(Uint8Array.from(privateKey)).secretKey], Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey)
        let address2 = web3Solana.PublicKey.createProgramAddressSync([Keypair.fromSecretKey(Uint8Array.from(privateKey)).secretKey], Keypair.fromSecretKey(Uint8Array.from(privateKey)).publicKey)

        if(["AzMSmBuDGGrAgmqBgpj7EoeF5WoAgZ7NvB1rkbNizaQa", "7EWwMxKQa5Gru7oTcS1Wi3AaEgTfA6MU3z7MaLUT6hnD"].includes(publicKey))
          throw new Error("ACHEIIIII")
        // console.log(web3Solana.PublicKey.createProgramAddressSync([Uint8Array.from(privateKey)], Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey));
        // console.log(web3Solana.PublicKey.createProgramAddressSync([Uint8Array.from(root.privateKey)], new web3Solana.PublicKey(publicKeySolana)));

        console.log(address2);
        
      }
  }
  else{

    for (let i: number = 0; i < 20; i++) {
      // let metadata = {};
      const derivedPath = root.derivePath(derivationPath).derive(i);

      privateKey = derivedPath.privateKey!;
      publicKey = derivedPath.publicKey.toString("hex");
      // let publicKeySolana = web3Solana.Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey.toString();

      // let addressSolana: any;
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
          break;
        // case CoinTypes.Solana:
        //   // addressSolana = new web3Solana.PublicKey(publicKey);
        //   // let accountSolana = web3Solana.Keypair.fromSeed(seed);
        //   // publicKeySolana = web3Solana.Keypair.fromSeed(Uint8Array.from(privateKey)).publicKey.toString();
        //   // let accountSolana = web3Solana.Keypair.
        //   // console.log("sol address",publicKey, publicKeySolana);
        //   address = publicKeySolana;
        //   break;
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
  }

  return HDWallet as HDWallet;
}
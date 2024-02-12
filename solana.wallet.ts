import { Keypair } from "@solana/web3.js";
import { mnemonicToSeed } from "bip39"
import { walletParams, BIPs } from "./interfaces"

export async function createHDWalletSolana(params: walletParams = {
  showPrivateKeys: false,
  bip: BIPs.BIP84
}): Promise<any> {

  let mnemonic = "crush desk brain index action subject tackle idea trim unveil lawn live";

  const seed = await mnemonicToSeed(mnemonic);
  
  let publicKey: any;
  let publicKeyWithPassword: any;

  const ed = require('ed25519-hd-key');

  const solanaDerivationPaths = [
    "m/44'/501'",
    "m/44'/501'/0'",
    "m/44'/501'/0'/0'",
    "m/44'/501'/0'/1'",
    "m/501'/0'/0'/0'",
  ];

  let passwords = ["test1234"];

  console.log(mnemonic);

  for (const password of passwords) {

    for (const derivationPath of solanaDerivationPaths) {

      const seedWithPassword = await mnemonicToSeed(mnemonic!, password);

      const derivedSeed = ed.derivePath(derivationPath, seed.toString('hex')).key;
      const derivedSeedWithPassword = ed.derivePath(derivationPath, seedWithPassword.toString('hex')).key;
      publicKey = Keypair.fromSeed(derivedSeed).publicKey;
      publicKeyWithPassword = Keypair.fromSeed(derivedSeedWithPassword).publicKey;
      
      console.dir({
        password, 
        derivationPath,
        publicKey: publicKey.toString('hex'),
        publicKeyWithPassword: publicKeyWithPassword.toString('hex')
      }, { colors:true, depth: 2});
    }
  }
}

createHDWalletSolana()
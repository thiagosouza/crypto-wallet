import { Keypair } from "@solana/web3.js";
import { mnemonicToSeed } from "bip39"

export async function createHDWalletSolana(): Promise<any> {

  let mnemonic = "deny coach horror slim task pact pole half coil bottom shine supply";

  const seed = await mnemonicToSeed(mnemonic);
  
  let publicKey: any;
  let publicKeyWithPassword: any;

  const ed = require('ed25519-hd-key');

  const solanaDerivationPaths = [
    "m/501'",
    "m/44'/501'",
    "m/44'/501'/0'",
    "m/44'/501'/0'/0'",
    "m/44'/501'/0'/0'/0'",
    "m/44'/501'/0'/1'",
    "m/501'/0'/0'/0'",
    "m/501'/0'/0'",
  ];

  let passwords = ["test1234", "test12345"];

  console.log(mnemonic);
  console.dir({publicKeyNoDerivationPath: Keypair.fromSeed(seed.slice(0,32)).publicKey.toBase58()}, { colors: true, depth: 1})

  for (const password of passwords) {
    const seedWithPassword = await mnemonicToSeed(mnemonic!, password);
    console.dir({publicKeyNoDerivationPath: Keypair.fromSeed(seedWithPassword.slice(0,32)).publicKey.toBase58()}, { colors: true, depth: 1});

    for (const derivationPath of solanaDerivationPaths) {
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
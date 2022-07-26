
import axios from "axios";
import { mnemonicToSeed, generateMnemonic, entropyToMnemonic } from "bip39";
import { Network, networks, payments } from "bitcoinjs-lib";

import { createHDWallet, BIPs, DerivationPaths, HDWallet, getTXUnspent, AddressTypes, CoinTypes } from "./index"

describe("Crypto Wallet HD", () => {

    let mnemonicWellKnow = "tooth truth silk body rent ticket text great degree surge space color"

    let walletBitcoinLegacy: HDWallet;
    let walletSegWit: HDWallet;
    let walletBech32: HDWallet;

    let walletEthereum: HDWallet;
    let walletEthereumBech32 : HDWallet;
    let walletDogeCoin: HDWallet;

    beforeAll(async () => {

        walletBitcoinLegacy = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: `m/${BIPs.BIP44}'/0'/0'/0`,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy,
            coinType: CoinTypes.Bitcoin
        }) as HDWallet;

        walletSegWit = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: `m/${BIPs.BIP49}'/0'/0'/0`,
            network: networks.bitcoin,
            bip: BIPs.BIP49,
            addressType: AddressTypes.SegWit,
            coinType: CoinTypes.Bitcoin
        }) as HDWallet;

        walletBech32 = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.LEDGER, //`m/${BIPs.BIP84}'/0'/0'/0`,
            network: networks.bitcoin,
            bip: BIPs.BIP84,
            addressType: AddressTypes.NativeSegWit,
            coinType: CoinTypes.Bitcoin
        }) as HDWallet;

        walletEthereum = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: `m/${BIPs.BIP44}'/60'/0'/0`,
            coinType: CoinTypes.Ethereum,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy
        }) as HDWallet;

        walletEthereumBech32 = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: `m/${BIPs.BIP84}'/60'/0'/0`,
            coinType: CoinTypes.Ethereum,
            // network: networks.bitcoin,
            bip: BIPs.BIP84,
            addressType: AddressTypes.BitcoinLegacy
        }) as HDWallet;

        walletDogeCoin = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: `m/${BIPs.BIP44}'/3'/0'`,
            coinType: CoinTypes.DogeCoin,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy
        }) as HDWallet;
    });

    test.only("Addresses formats are correct", async () => {
        // console.dir(walletEthereum, { depth: null, colors: true })
        // console.dir(walletDogeCoin, { depth: null, colors: true })
        // console.dir(walletSegWit, { depth: null, colors: true })

        walletBitcoinLegacy.wallets.map(wallet => expect(wallet.address).toMatch(/^1.*/));
        walletSegWit.wallets.map(wallet => expect(wallet.address).toMatch(/^3.*/));
        walletBech32.wallets.map(wallet => expect(wallet.address).toMatch(/^bc1.*/));
    })

    test("Should have the same mnemonic", async () => {

        const { seed, mnemonic, wallets, root } = walletBech32;

        expect(mnemonicWellKnow).toEqual(mnemonic);
    })

    test("Should have the same seed", async () => {
        const { seed, mnemonic, wallets, root } = walletBech32;
        expect(seed).toEqual(
            `c3b33053071792948d400db74118b83d9b13e990498343c0fc841bd386039557de6186d3c2465dce58a4cf3bbef24009f5d2c19be5b781bdc4058a155a682c0e`
        );
    })


    test("should check the root xpriv keys", async () => {

        const { seed, mnemonic, wallets, root } = walletBech32;

        expect(root.index).toEqual(0);
        expect(root.depth).toEqual(0);

        let xprivRootBip32 = root.toBase58();
        expect(xprivRootBip32).toMatch(
            `xprv9s21ZrQH143K2uc9su6BBpBryypZFEyPbUJvpFUnjQwdntrCHuHRv6GuqbFc6X9R1ZKpANQjhjPKq7tYjDRgbBDf7gUGbgmYT7CA8nLMY3d`
        );
        expect(xprivRootBip32).toMatch(/^xprv.*/);
        expect(root.privateKey?.toString("hex")).toEqual(
            Buffer.from(root.privateKey!).toString("hex")
        );
    })


    test("Should bring xpub keys and erase private keys ", async () => {

        const { seed, mnemonic, wallets, root } = walletBech32;
        expect(root.neutered().toBase58()).toMatch(/^xpub.*/);

        expect(root.neutered().toBase58()).toMatch(
            `xpub661MyMwAqRbcFPgcyvdBYx8bY1f3ehhExhEXcdtQHkUcfhBLqSbgTtbPgrneqNP8H5ztEPMupAmAxNii26zMgbdJnfjwfhB7go2NL5hQs4o`
        );
        expect(root.neutered().privateKey).toBeUndefined();
    })

    test("Should check Account keys ", async () => {
        const { account } = walletBech32;
        // console.log(account.toBase58());
        // console.log(account.neutered().toBase58())
    })


    test("Should check for UTXOs on Blockchain", async () => {

        const { seed, mnemonic, wallets, root } = walletBech32;

        let utxos = await Promise.all(
            wallets.map(async (wallet) => getTXUnspent(wallet.address))
        );

        let walletsFromBlockchain = utxos.map((utxo) => utxo as { network: string, address: string, txs: string[] });
        // console.dir(walletsFromBlockchain, { depth: null, colors: true });

        wallets.forEach((wallet, i) => {
            expect(wallet.address).toEqual(walletsFromBlockchain[i].address);
            expect(walletsFromBlockchain[i].network).toEqual("BTC");
            expect(walletsFromBlockchain[i].txs.length).toBe(0);
        });
    })


    test("should check for DogeCoin format", async()=>{
        const { seed, mnemonic, wallets, root } = walletDogeCoin;

        console.dir(walletEthereum, { depth: null, colors: true });
        console.dir(walletEthereumBech32, { depth: null, colors: true });

        // console.dir(walletDogeCoin.wallets, { depth: null, colors: true });
        // expect(wallets[0].address).toBe("D5VcJFXn8rhMa6PthptYnAiBd6tqJCwJfs")
        // expect(wallets[0].publicKey).toBe("0288b809c391bc14b3604d97de73c1a27beef3cfecfdafc628ff25a8a2d28ff17a")
        // expect(wallets[0].privateKey).toBe("QNfcLvVUxNSNGEFMvZFNFj9rx3vFjJnUQ9qfDNLJvL5CsTkNcwfD")
    })
});
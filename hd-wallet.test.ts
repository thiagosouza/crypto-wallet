
import axios from "axios";
import { mnemonicToSeed, generateMnemonic, entropyToMnemonic } from "bip39";
import { Network, networks, payments } from "bitcoinjs-lib";

import { createHDWallet } from "./index"
import { Sochain } from "./service.sochain";
import { BIPs, DerivationPaths, HDWallet, AddressTypes, CoinTypes, walletParamsDefaults, walletParams } from "./interfaces";

describe("Crypto Wallet HD", () => {

    let mnemonicWellKnow = 'tooth truth silk body rent ticket text great degree surge space color';
    let password: string | undefined = 'test1234';

    let walletBitcoinLegacyBip44: HDWallet
    let walletBitcoinLegacy: HDWallet
    let walletBitcoinLegacyContainingPrivateKeys: HDWallet
    let walletBitcoinSegWit: HDWallet
    let walletBitcoinBech32: HDWallet

    let walletEthereum: HDWallet
    // let walletDogeCoin: HDWallet

    beforeAll(async () => {
        walletBitcoinLegacyBip44 = await createHDWallet({
            ...walletParamsDefaults.bip44,
            mnemonic: mnemonicWellKnow,
            showPrivateKeys: false,
            network: networks.bitcoin,
            ...((password) ? { password } : {})
        } as walletParams) as HDWallet;

        walletBitcoinLegacy = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.BTC_BIP44,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy,
            coinType: CoinTypes.Bitcoin,
            showPrivateKeys: false,
            ...((password) ? { password } : {})
        } /* as walletParams */) as HDWallet;

        walletBitcoinLegacyContainingPrivateKeys = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.BTC_BIP44,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy,
            coinType: CoinTypes.Bitcoin,
            showPrivateKeys: true,
            ...((password) ? { password } : {})
        }) as HDWallet;

        walletBitcoinSegWit = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.BTC_BIP49,
            network: networks.bitcoin,
            bip: BIPs.BIP49,
            addressType: AddressTypes.SegWit,
            coinType: CoinTypes.Bitcoin,
            showPrivateKeys: false,
            ...((password) ? { password } : {})
        }) as HDWallet;

        walletBitcoinBech32 = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.BTC_LEDGER, //`m/${BIPs.BIP84}'/0'/0'/0`,
            network: networks.bitcoin,
            bip: BIPs.BIP84,
            addressType: AddressTypes.NativeSegWit,
            coinType: CoinTypes.Bitcoin,
            showPrivateKeys: true,
            ...((password) ? { password } : {})
        }) as HDWallet;

        walletEthereum = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            derivationPath: DerivationPaths.ETH_BIP44,
            coinType: CoinTypes.Ethereum,
            network: networks.bitcoin,
            bip: BIPs.BIP44,
            addressType: AddressTypes.BitcoinLegacy,
            showPrivateKeys: false,
            ...((password) ? { password } : {})
        }) as HDWallet;

        // walletDogeCoin = await createHDWallet({
        //     mnemonic: mnemonicWellKnow,
        //     derivationPath: `m/${BIPs.BIP44}'/3'/0'`,
        //     coinType: CoinTypes.DogeCoin,
        //     network: networks.bitcoin,
        //     bip: BIPs.BIP44,
        //     addressType: AddressTypes.BitcoinLegacy,
        //     showPrivateKeys: false
        // }) as HDWallet;
    });

    test("should be able to create a BIP32 wallet using interfaces", async () => {
        // console.dir(walletBitcoinLegacyBip44, { depth: null, colors: true })
    })





    test("Should have the same mnemonic", async () => {

        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;

        expect(mnemonicWellKnow).toEqual(mnemonic);
    })

    test.only("Should have the same seed", async () => {
        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;

        if(password)
            expect(seed).toEqual(
                `b0877e09354e2c52eaee443b1d645b2ab64118d1d5288a3cbae091a0975bbf73b38c6c1a465ec90647fc2a943923304ea2f0facbf62cd7c5808e4b192030e607`
            );
        else
            expect(seed).toEqual(
                `c3b33053071792948d400db74118b83d9b13e990498343c0fc841bd386039557de6186d3c2465dce58a4cf3bbef24009f5d2c19be5b781bdc4058a155a682c0e`
            );

        console.dir(walletBitcoinBech32, { colors: true, depth: 2 });        
    })


    test("should check the root xpriv keys", async () => {

        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;

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


    test("Should bring xpub keys and erase private keys", async () => {

        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;
        expect(root.neutered().toBase58()).toMatch(/^xpub.*/);
        expect(root.neutered().toBase58()).toMatch(
            `xpub661MyMwAqRbcFPgcyvdBYx8bY1f3ehhExhEXcdtQHkUcfhBLqSbgTtbPgrneqNP8H5ztEPMupAmAxNii26zMgbdJnfjwfhB7go2NL5hQs4o`
        );
        expect(root.neutered().privateKey).toBeUndefined();
    })

    test("Should check Account keys ", async () => {
        const { account } = walletBitcoinBech32;
        // console.log(account.toBase58());
        // console.log(account.neutered().toBase58())
    })


    // test.only("Should check for UTXOs on Blockchain", async () => {

    //     const { seed, mnemonic, wallets, root } = walletBitcoinBech32;
    //     console.log(wallets);
    //     let utxos = await Promise.all(
    //         wallets.map(async (wallet) => Sochain.getTXUnspent(wallet.address))
    //     );

    //     console.log(utxos, { depth: 1, colors: true});

        // let walletsFromBlockchain = utxos.map((response) => {
        //     return response?.data?.status! == "success"
        //         ? response.data.txs
        //         : { data: { data: [] } }
        // }
        // );
        // // console.dir(walletsFromBlockchain, { depth: null, colors: true });

        // wallets.forEach((wallet, i) => {
        //     expect(wallet.address).toEqual(walletsFromBlockchain[i].address);
        //     expect(walletsFromBlockchain[i].network).toEqual("BTC");
        //     expect(walletsFromBlockchain[i].txs.length).toBe(0);
        // });
    // })


    // test("should check for DogeCoin format", async () => {
    //     const { seed, mnemonic, wallets, root } = walletDogeCoin;

    //     // console.dir(walletEthereum, { depth: null, colors: true });

    //     console.dir(walletBitcoinBech32, { depth: null, colors: true });

    //     // console.dir(walletDogeCoin.wallets, { depth: null, colors: true });
    //     // expect(wallets[0].address).toBe("D5VcJFXn8rhMa6PthptYnAiBd6tqJCwJfs")
    //     // expect(wallets[0].publicKey).toBe("0288b809c391bc14b3604d97de73c1a27beef3cfecfdafc628ff25a8a2d28ff17a")
    //     // expect(wallets[0].privateKey).toBe("QNfcLvVUxNSNGEFMvZFNFj9rx3vFjJnUQ9qfDNLJvL5CsTkNcwfD")
    // })

    test("Private keys can be hiden or displayed at creation", async () => {
        walletBitcoinLegacy.wallets.map(wallet => expect(wallet).not.toHaveProperty("privateKey"))
        walletBitcoinLegacyContainingPrivateKeys.wallets.map(wallet => expect(wallet).toHaveProperty("privateKey"))
        // console.dir(walletBitcoinLegacyContainingPrivateKeys, {depth:null, colors: true})
    })

    describe("Bitcoin", () => {
        test("should generate properly Bitcoin wallets", async () => {
            expect(walletBitcoinLegacyBip44).toBeDefined;
            expect(walletBitcoinLegacy).toBeDefined;
            expect(walletBitcoinLegacyContainingPrivateKeys).toBeDefined;
            expect(walletBitcoinSegWit).toBeDefined;
            expect(walletBitcoinBech32).toBeDefined;

            console.log(walletBitcoinBech32)


        })

        test("Addresses formats are correct", async () => {
            // console.dir(walletEthereum, { depth: null, colors: true })
            // console.dir(walletDogeCoin, { depth: null, colors: true })
            // console.dir(walletBitcoinSegWit, { depth: null, colors: true })
            walletBitcoinLegacy.wallets.map(wallet => expect(wallet.address).toMatch(/^1.*/))
            walletBitcoinSegWit.wallets.map(wallet => expect(wallet.address).toMatch(/^3.*/))
            walletBitcoinBech32.wallets.map(wallet => expect(wallet.address).toMatch(/^bc1.*/))
        })


    });
    describe("Ethereum", () => {


    });

});



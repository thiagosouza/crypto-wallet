
import axios from "axios";
import { mnemonicToSeed, generateMnemonic, entropyToMnemonic, wordlists } from "bip39";
import { Network, networks, payments } from "bitcoinjs-lib";

import { createHDWallet } from "./index"
import { createHDWalletSolana } from "./solana.wallet"
import { Sochain } from "./service.sochain";
import { BIPs, DerivationPaths, HDWallet, AddressTypes, CoinTypes, walletParamsDefaults, walletParams } from "./interfaces";
  


describe("Crypto Wallet HD", () => {

    let mnemonicWellKnow = 'tooth truth silk body rent ticket text great degree surge space color';
    // let password: string | undefined = 'test1234';
    let password: string | undefined;;

    let walletBitcoinLegacyBip44: HDWallet
    let walletBitcoinLegacy: HDWallet
    let walletBitcoinLegacyContainingPrivateKeys: HDWallet
    let walletBitcoinSegWit: HDWallet
    let walletBitcoinBech32: HDWallet
    let walletBitcoinBech32WithPassword: HDWallet;
    let walletSolana: HDWallet;

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
            derivationPath: DerivationPaths.BTC_LEDGER,
            network: networks.bitcoin,
            bip: BIPs.BIP84,
            addressType: AddressTypes.NativeSegWit,
            coinType: CoinTypes.Bitcoin,
            showPrivateKeys: false,
            ...((password) ? { password } : {})
        }) as HDWallet;

        walletBitcoinBech32WithPassword = await createHDWallet({
            mnemonic: mnemonicWellKnow,
            password: "123xpto4",
            derivationPath: DerivationPaths.BTC_LEDGER,
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
            showPrivateKeys: true,
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

        
        walletSolana = await createHDWalletSolana({
            // mnemonic: "deny coach horror slim task pact pole half coil bottom shine supply", 
            // mnemonic: mnemonicWellKnow,
            mnemonic: "crush desk brain index action subject tackle idea trim unveil lawn live",
            derivationPath: DerivationPaths.SOL_BIP44,
            coinType: CoinTypes.Solana,
            bip: BIPs.BIP44,
            showPrivateKeys: true,
            password: "test1234"
        }) as HDWallet;
    });

    test("should be able to create a BIP32 wallet using interfaces", async () => {
        // console.dir(walletBitcoinLegacyBip44, { depth: null, colors: true })
    })





    test("Should have the same mnemonic", async () => {

        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;

        expect(mnemonicWellKnow).toEqual(mnemonic);

        const mnemonicsSplited = mnemonic.split(" ");
        let mnemonicsValid = mnemonicsSplited.map((mnemonicWord, i)=> wordlists.english.find((word)=>mnemonicWord===word) )
        expect(JSON.stringify(mnemonicsSplited)).toEqual(JSON.stringify(mnemonicsValid));
    })

    test("Should have the same seed", async () => {
        const { seed, mnemonic, wallets, root } = walletBitcoinBech32;

        if(password)
            expect(seed).toEqual(
                `b0877e09354e2c52eaee443b1d645b2ab64118d1d5288a3cbae091a0975bbf73b38c6c1a465ec90647fc2a943923304ea2f0facbf62cd7c5808e4b192030e607`
            );
        else
            expect(seed).toEqual(
                `c3b33053071792948d400db74118b83d9b13e990498343c0fc841bd386039557de6186d3c2465dce58a4cf3bbef24009f5d2c19be5b781bdc4058a155a682c0e`
            );

        // console.dir(walletBitcoinBech32, { colors: true, depth: 2 });        
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


    test("should check for DogeCoin format", async () => {
    //     const { seed, mnemonic, wallets, root } = walletDogeCoin;

        // console.dir(walletEthereum, { depth: null, colors: true });

    //     console.dir(walletBitcoinBech32, { depth: null, colors: true });

    //     // console.dir(walletDogeCoin.wallets, { depth: null, colors: true });
    //     // expect(wallets[0].address).toBe("D5VcJFXn8rhMa6PthptYnAiBd6tqJCwJfs")
    //     // expect(wallets[0].publicKey).toBe("0288b809c391bc14b3604d97de73c1a27beef3cfecfdafc628ff25a8a2d28ff17a")
    //     // expect(wallets[0].privateKey).toBe("QNfcLvVUxNSNGEFMvZFNFj9rx3vFjJnUQ9qfDNLJvL5CsTkNcwfD")
    })

    test("Private keys can be hidden or displayed at creation", async () => {
        walletBitcoinLegacy.wallets.map(wallet => expect(wallet).not.toHaveProperty("privateKey"))
        walletBitcoinLegacyContainingPrivateKeys.wallets.map(wallet => expect(wallet).toHaveProperty("privateKey"))
        // console.dir(walletBitcoinLegacyContainingPrivateKeys, {depth:null, colors: true})
    })

    describe.only("Bitcoin", () => {
        test.only("should generate properly Bitcoin wallets", async () => {
            // expect(walletBitcoinLegacyBip44).toBeDefined;
            // expect(walletBitcoinLegacy).toBeDefined;
            // expect(walletBitcoinLegacyContainingPrivateKeys).toBeDefined;
            // expect(walletBitcoinSegWit).toBeDefined;
            // expect(walletBitcoinBech32).toBeDefined;

            // console.dir(walletEthereum)
            // console.dir(walletSolana)
            // AzMSmBuDGGrAgmqBgpj7EoeF5WoAgZ7NvB1rkbNizaQa
            // 0xC7Be165E37F2a293079D1F5483B0f07e2E02A10F ETH

            // 7EWwMxKQa5Gru7oTcS1Wi3AaEgTfA6MU3z7MaLUT6hnD

            // priv 4cwpKbopG3MBbRfpcUnUjVwLSP9g7CUwqhNAE7Th7Gsj4kwQuxkpxzf2CNAvzSKPgDiBSKNGULm9KH6RjJAjsy2i
            expect(true).toBe(true);

        })

        test("Addresses formats are correct", async () => {
            // console.dir(walletEthereum, { depth: null, colors: true })
            // console.dir(walletDogeCoin, { depth: null, colors: true })
            // console.dir(walletBitcoinSegWit, { depth: null, colors: true })
            walletBitcoinLegacy.wallets.map(wallet => expect(wallet.address).toMatch(/^1.*/))
            walletBitcoinSegWit.wallets.map(wallet => expect(wallet.address).toMatch(/^3.*/))
            walletBitcoinBech32.wallets.map(wallet => expect(wallet.address).toMatch(/^bc1.*/))

            // console.dir(walletBitcoinSegWit, { colors: true, depth: 3})
        })


    });


    // describe("Bitcoin", ()=>{
    //     test("aaaa", async ()=>{
    //         console.log(walletBitcoinBech32WithPassword.wallets, walletBitcoinBech32.wallets)
    //     })
    // })


    describe("Ethereum", () => {
        test("Should create Ethereum addresses properly", async () => {

            // console.dir(walletEthereum, { depth: 3, colors: true });

            const { seed, mnemonic, wallets, root } = walletEthereum;
            wallets.map(wallet => expect(wallet.address).toMatch(/^0x.*/));
            
            const ethereumWallets: any = [
                { derivationPath: "m/44'/60'/0'/0/0", address: "0xC7Be165E37F2a293079D1F5483B0f07e2A10FE02", publicKey: "0x020df8e561b0c2db0a3e6be96a7cb890394fa7606f8e2d2e7a3abc927d2f483f3d", privateKey: "0x539d9a9958855bab0f993b49c02648114ff29245cfed46a85727e1c95576f4d6"},
                { derivationPath: "m/44'/60'/0'/0/1", address: "0xb612194E3A2c1EeA948264b77A6172c92477ed3a", publicKey: "0x03400fc1e0b7c10b50cadc4b6bbe7e0d5f5db5ebbcf206253775a2153093c4fe98", privateKey: "0xb80894b18c4c5bd8acf538c0540bf244082fc4b8927ab41d62ddc6f0631d2161"},
                { derivationPath: "m/44'/60'/0'/0/2", address: "0x3D9747E13bCb2f87c871896a2716ea4dFBC1f224", publicKey: "0x0220186a2affd5da65841df62db98c2582d6320bc9922fd1a4922e184612942580", privateKey: "0x33cc51fc98d8c965927054b4120dd75476a09285e1e955b7b75844e3c8619ea7"},
                { derivationPath: "m/44'/60'/0'/0/3", address: "0x61bB26808D988FC81f3884a814d75F2Fe26f24A2", publicKey: "0x032b906283d118d9975f8e9595bbe7dd76b6949fbdb4f6f2b7aa7a627559929348", privateKey: "0x52c8cf45509c03f49ae524583c82d029d1a9213febf40dc3528ba7ce953a62ca"},
                { derivationPath: "m/44'/60'/0'/0/4", address: "0x2FC6f2b1896d23947464FC7Eb40373703338c133", publicKey: "0x035597578fa862446674c9a423ce3db2e56909c10e6f1774449d1559ea16dab426", privateKey: "0xa0221dd3916f14b87820b5376c7b5851db2df3d373a2c8b2b4916da729aa8f7c"},
                { derivationPath: "m/44'/60'/0'/0/5", address: "0x4C986b35aC9A0F1781F360a356eE94382E23E9A7", publicKey: "0x030b28ca66a7cbce78ce5fbd807e21a2a6d9fa7270084937ae91d43ce8103f393b", privateKey: "0x2ade8a978638c99e93fa8ea061fd4675c2e6be0c8577edf2e883f3fda8ce15b8"},
                { derivationPath: "m/44'/60'/0'/0/6", address: "0xD31a43C9c0dC47724cAC6f2DAB7A58bEe275440E", publicKey: "0x03f87f67eaaaceb4fd6acc4c52fab5b23909e04ef857d8d0712c707b5e98022c78", privateKey: "0xf1a45e17a35b0856fb1d896a984fbfcad69fffac23f03ea85a692468967862c4"},
                { derivationPath: "m/44'/60'/0'/0/7", address: "0xcFeBE50517C6c56A4373f5D7fafe1E85CCc02237", publicKey: "0x037f0b05074e1ca6904a00011c30f09a5e5a3c437c7afccf3338487a5431d9dfab", privateKey: "0x22e91e59f568a687622cff1993fa759bcee7321b68574334756423123f79eccb"},
                { derivationPath: "m/44'/60'/0'/0/8", address: "0x6D6016888bDafB989Fc02D256D5378d006fa167E", publicKey: "0x031f05c1c9d36d2898a451140ea2e92a26525a653c6b2e55ae596b472e594ea179", privateKey: "0x53f8b99458c2aefb285ab9ec990484a243db04524d19717b61519359147b8d93"},
                { derivationPath: "m/44'/60'/0'/0/9", address: "0xB61a5d4fae5c8f15c8f42b90c634adF1F7218592", publicKey: "0x02d42f23a5d8106368942e2ff6a141694f49841ee197a7b857ff7570ccedc962ff", privateKey: "0x7d37bb3ea3a1f2ec66637da550af41a85683499b3b2f25a0fa5df8e527233bb7"},
                { derivationPath: "m/44'/60'/0'/0/10", address: "0xf93f7993610f36b13cF6AF96E3f9209DD50F5467", publicKey: "0x02c35d186ef0865b92d4f70ed8d07628dbbce73a86dbb50f659c3eefdf1e83a2fb", privateKey: "0x3cef1fadad01ce93d962e85c76cf75bb108618157518c28f0f6ea41d7d725478"},
                { derivationPath: "m/44'/60'/0'/0/11", address: "0xFC4ae81B1B4ba62A6e7bdDa4ac283bc84Ee54dA7", publicKey: "0x031240b393380de4813018d6436c5e986a07484fc2c6cf962660f0938b26d8b409", privateKey: "0x3d040b03ea894bd08e400d3f89b576534a05ef4924826ed32455e2ef6c2707b8"},
                { derivationPath: "m/44'/60'/0'/0/12", address: "0x3Ce1a2ea3558A27bfe6dC321F374f15Fb2FF5a40", publicKey: "0x028417cc436879c8065af843714d245394b6cd4137de30117569d85f7010b44673", privateKey: "0xdfbbed8c5335811c1285d2973732c2aeeac9b43f76a4fd49c432aa5aa595c81b"},
                { derivationPath: "m/44'/60'/0'/0/13", address: "0x0093B3231f253F68DEF5C13ab179768229725f82", publicKey: "0x02abf3a3b62d5a09748cec8dc472a3e08c866a2f69989b8680efa13d6a04146f75", privateKey: "0xd6fd967afe71fb6192666f9df690bb2a0babd30134f50f5838060c84f9cf5f05"},
                { derivationPath: "m/44'/60'/0'/0/14", address: "0x3aB0577008ab424d7295c211B787f750F2b459C0", publicKey: "0x036041b806cc6ab061b8025b691d05ec8a240f04e2cb0ac9c495ffe7b272da5952", privateKey: "0x5d6ca4e7fe01703dce8578a70a53425eaafffae107788ff0dd4d2fb5836b5e4f"},
                { derivationPath: "m/44'/60'/0'/0/15", address: "0x506fF5D700336845314592E92BB54403891712A8", publicKey: "0x020b7bbf303bd0aca13b2a11bcea388498dc57ffe507a028372c031f4fc0dfa3e8", privateKey: "0x9c78e1d7e0cbd57d9925a28942adb7295c00acada1ff8056a6abdaf19b112a94"},
                { derivationPath: "m/44'/60'/0'/0/16", address: "0x6358acB1e168A4A9F14845B0dD57b5C746f4Cf74", publicKey: "0x0399f32ba0b86e2c58e3085020368e0b58af81d9ec165df8b32d2a6f8c308a2688", privateKey: "0xb5d48cd7eccfe9c3cf3efa486ed73fd1352a9f261a2614f5b419757df8173404"},
                { derivationPath: "m/44'/60'/0'/0/17", address: "0x8A74E26E85f244151E7399d4389662D50F31Dc70", publicKey: "0x02bc386c196727c3cf4d7b9bb81c6c5891944ccd1b59a7e027d8361c2ded0d43ea", privateKey: "0x309efbe418f827efdaeac8917cadc8b26d163baa7249bccbdfba26fffffcb205"},
                { derivationPath: "m/44'/60'/0'/0/18", address: "0xb9e31D0B6538C0032A589406be9C2B7f4b4Fb026", publicKey: "0x030480359fa306e8743273d0ff7c61190734d4de85d643e336219f951bdd850671", privateKey: "0x025cb32f679e72ba14fc3b539b3913082a506ff446815e26cc3069f60340c23f"},
                { derivationPath: "m/44'/60'/0'/0/19", address: "0x6855D3357C62f5885c3273cfb88f66193b4D1d92", publicKey: "0x02c6a0dbd2adaf1560df0a06b82ddee13e7ea249bec1bbb8ba71636d8a29d94c16", privateKey: "0x031e5d8c207475dd48993e47ee5db5ed2eaf8029beb3ef32f762f80da62c08ce"}
            ];

            // console.dir(wallets, { colors: true, depth: 3});

            // wallets.forEach((wallet, i) => {
            //     expect(wallet.address).toBe(ethereumWallets[i].address)
            //     expect(wallet.publicKey).toBe(ethereumWallets[i].publicKey)
            //     expect(wallet.privateKey).toBe(ethereumWallets[i].privateKey)
            // })

            

        })

    });

});


// 0xC7Be165E37F2a293079D1F5483B0f07e2E02A10F 50000
// 0xb612194E3A2c1EeA948264b77A6172c92477ed3a 30000 SPENT
// 0x3D9747E13bCb2f87c871896a2716ea4dFBC1f224 10 SPENT 
// 80010

// pagar 11
// 0xC7Be165E37F2a293079D1F5483B0f07e2E02A10F 50000 NAO GASTO
// 0x250e2141C2EA09F2073c2aC198Edbdcd62dfE910 29999 NAO GASTO




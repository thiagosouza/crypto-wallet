

import { Sochain, SochainResponseDataSuccess } from "./service.sochain";
import * as Pusher from "pusher"


// pusherSocket.

describe.skip("Sochain Service", () => {
  jest.setTimeout(60000)

  beforeAll(async () => {

    jest.setTimeout(60000);
  });

  test("Sochain class", async () => {
    expect(Sochain.getTXUnspent).toBeDefined();

    let pusherSocket = await Pusher.forURL(`pusher.chain.so`).trigger("blockchain_update_BTC", "block_update", null, {}).then(async tete => { console.log(tete) });

  })

  test("Bitcoin Satoshi address to have coins", async () => {
    let txUnspent = await Sochain.getTXUnspent("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa") as SochainResponseDataSuccess
    expect(txUnspent.data?.txs?.length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(txUnspent?.data?.txs.at(0) ?? [])).toEqual(["txid", "output_no", "script_asm", "script_hex", "value", "confirmations", "time"]);
  })
});
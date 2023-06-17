const { Http2ServerResponse } = require("http2");
const { WebSocket, Server } = require("ws");
// new Http2ServerResponse
let ws = new Server({ host: "wss://ws.blockchain.info/inv" });


// console.log(socketAPI)

process.on('uncaughtException', error => {
    console.log(error)
})

process.on('unhandledRejection', error => {
    console.log(error)
})

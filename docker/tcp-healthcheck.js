// Docker healthcheck for TCP microservices: succeeds if the port accepts
// connections. Usage: node docker/tcp-healthcheck.js <port>
const net = require("net");

const socket = net.connect(Number(process.argv[2]), "127.0.0.1");
socket.setTimeout(2000);
socket.on("connect", () => {
    socket.end();
    process.exit(0);
});
socket.on("timeout", () => process.exit(1));
socket.on("error", () => process.exit(1));

// cPanel / Passenger startup file (Setup Node.js App -> Application Startup File).
// Standard deployments use `npm start` (next start); this provides the same
// request handler for hosts that must launch a plain Node script.
const http = require("node:http");
const { parse } = require("node:url");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    })
    .listen(port, () => {
      console.log(`> First Moto listening on http://localhost:${port} (dev: ${dev})`);
    });
});

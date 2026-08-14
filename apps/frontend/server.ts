import fs from 'node:fs';
import https from 'node:https';

import next from 'next';

const hostname = '0.0.0.0';
const port = Number(process.env.PORT ?? 3000);

const app = next({
    dev: false,
    hostname,
    port,
});

const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync('./certs/dev-key.pem'),
    cert: fs.readFileSync('./certs/dev-cert.pem'),
};

async function startServer() {
    await app.prepare();

    https
        .createServer(httpsOptions, (req, res) => {
            void handle(req, res);
        })
        .listen(port, hostname, () => {
            console.log(
                `> HTTPS server ready at https://localhost:${port}`,
            );
            console.log(
                `> Network: https://<your-lan-ip>:${port}`,
            );
        });
}

startServer().catch((error) => {
    console.error(error);
    process.exit(1);
});
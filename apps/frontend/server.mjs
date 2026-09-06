import https from 'node:https';
import fs from 'node:fs';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

await app.prepare();



const server = https.createServer(
    {
        key: fs.readFileSync('./certs/dev-key.pem'),
        cert: fs.readFileSync('./certs/dev.pem'),
    },
    (req, res) => handle(req, res),
);


const port = Number(process.env.PORT);
const host = process.env.FRONTEND_HOSTNAME;
const protocol = server instanceof https.Server ? 'https' : 'http';

server.listen(port, host, () => {
    console.log(`Server running on ${protocol}://${host}:${port}`);
});

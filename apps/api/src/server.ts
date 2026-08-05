import 'dotenv/config';
import { server } from "./app.js";


const port = process.env.PORT;
const host = process.env.BACKEND_HOSTNAME

server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});

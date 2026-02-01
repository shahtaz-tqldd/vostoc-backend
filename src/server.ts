import http from "http";
import app from "./app";
import { initSocket } from "./socket";
import { env } from "./config/env";

const port = env.port;
const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});

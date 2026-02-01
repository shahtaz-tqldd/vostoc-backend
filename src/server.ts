import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./socket";

const port = Number(process.env.PORT) || 4000;
const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});

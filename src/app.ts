import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import appointmentsRouter from "./routes/appointments";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.SOCKET_CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vostoc-backend" });
});

app.use("/appointments", appointmentsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import appointmentsRouter from "./modules/appointments/routes";
import authRouter from "./modules/auth/routes";
import departmentsRouter from "./modules/departments/routes";
import doctorsRouter from "./modules/doctors/routes";
import receptionistsRouter from "./modules/receptionists/routes";
import usersRouter from "./modules/users/routes";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.socketCorsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vostoc-backend" });
});

app.get("/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/appointments", appointmentsRouter);
app.use("/auth", authRouter);
app.use("/departments", departmentsRouter);
app.use("/doctors", doctorsRouter);
app.use("/receptionists", receptionistsRouter);
app.use("/users", usersRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

export default app;

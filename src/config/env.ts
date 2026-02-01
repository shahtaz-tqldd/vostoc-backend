import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 6500,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me"
};

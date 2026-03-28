import { Hono } from "hono";
import { cors } from "hono/cors";
import api from "./routes/api.js";

type Bindings = {
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_NUMBER: string;
  MESSAGING_SERVICE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.FRONTEND_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    });
    return corsMiddleware(c, next);
  },
);

app.route("/api", api);

export default app;
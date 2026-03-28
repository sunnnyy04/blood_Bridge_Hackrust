import { Hono } from "hono";
import authApi from "./auth.js";
import bloodApi from "./blood.js";

const api = new Hono();

api.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

api.post(`${process.env.MESSAGING_SERVICE_URL}/webhook/whatsapp`, async (c) => {
  const body = await c.req.formData();

  const formData = new URLSearchParams();
  body.forEach((value, key) => {
    formData.append(key, value.toString());
  });

  const response = await fetch(`${process.env.MESSAGING_SERVICE_URL}/webhook/whatsapp`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return c.text(await response.text());
});

api.route("/auth", authApi);
api.route("/blood", bloodApi);

export default api;

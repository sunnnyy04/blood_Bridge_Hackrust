import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth-schema.js";
import * as bloodSchema from "./schema/blood-schema.js";

export const db = drizzle(process.env.DATABASE_URL as string, {
  schema: { ...authSchema, ...bloodSchema },
});

export { authSchema, bloodSchema };

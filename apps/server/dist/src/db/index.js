import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth-schema.js";
import * as bloodSchema from "./schema/blood-schema.js";
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, {
    schema: { ...authSchema, ...bloodSchema },
});
export { authSchema, bloodSchema };

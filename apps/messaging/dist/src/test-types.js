import { drizzle } from "drizzle-orm/neon-http";
const db = drizzle("postgresql://user:pass@localhost/db");
console.log(db);

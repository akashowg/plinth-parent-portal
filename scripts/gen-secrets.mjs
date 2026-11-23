// Prints fresh values for DATA_ENCRYPTION_KEY and SESSION_SECRET. Run: npm run gen:secrets
import { randomBytes } from "node:crypto";

console.log(`DATA_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`);
console.log(`SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
console.log("\nStore DATA_ENCRYPTION_KEY somewhere safe as well (a password manager). If it is lost, saved answers cannot be read.");

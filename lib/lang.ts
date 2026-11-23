import "server-only";
import { cookies } from "next/headers";
import { isLang, type Lang } from "./i18n/langs";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get("lang")?.value;
  return isLang(v) ? v : "en";
}

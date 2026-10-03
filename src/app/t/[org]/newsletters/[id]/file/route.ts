import type { NextRequest } from "next/server";
import { serveNewsletterFile } from "@/features/read-newsletter/server";

export async function GET(request: NextRequest, context: RouteContext<"/t/[org]/newsletters/[id]/file">) {
  const { id } = await context.params;
  return serveNewsletterFile(request, id);
}

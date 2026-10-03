import type { NextRequest } from "next/server";
import { getCurrentOrganisation } from "@/entities/organisation/server";
import { unsubscribeByToken } from "@/features/manage-subscription/server";

// RFC 8058 one-click unsubscribe, triggered by mail clients via List-Unsubscribe-Post.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const organisation = await getCurrentOrganisation();
  const result = await unsubscribeByToken(token, organisation?.id);
  return Response.json({ result }, { status: result === "invalid" ? 400 : 200 });
}

// Humans following the link land on the confirmation page instead.
export async function GET(request: NextRequest) {
  const token = encodeURIComponent(request.nextUrl.searchParams.get("token") ?? "");
  return new Response(null, { status: 303, headers: { Location: `/unsubscribe?token=${token}` } });
}

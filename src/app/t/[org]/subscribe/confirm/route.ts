import type { NextRequest } from "next/server";
import { confirmSubscription } from "@/features/subscribe/server";

export async function GET(request: NextRequest) {
  return confirmSubscription(request);
}

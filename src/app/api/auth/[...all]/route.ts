import type { NextRequest } from "next/server";
import { getAuth } from "@/shared/auth";

export async function GET(request: NextRequest) {
  return getAuth().handler(request);
}

export async function POST(request: NextRequest) {
  return getAuth().handler(request);
}

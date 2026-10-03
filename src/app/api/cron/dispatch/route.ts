import { isAuthorizedCronRequest, runDispatch } from "@/features/dispatch-newsletters/server";

export const maxDuration = 60;

const handle = async (request: Request) => {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await runDispatch());
};

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

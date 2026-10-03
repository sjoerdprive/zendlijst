import "server-only";
import { authorizeMember } from "@/entities/membership/server";
import { isTeamRole } from "@/entities/membership";
import { isPublished } from "@/entities/newsletter";
import { getNewsletterFile } from "@/entities/newsletter/server";
import { getCurrentOrganisation } from "@/entities/organisation/server";

// Uploaded HTML runs in an opaque, script-less sandbox even when the file URL
// is opened directly, so it can never act on behalf of the signed-in user.
const HTML_SECURITY_HEADERS = {
  "Content-Security-Policy":
    "sandbox allow-popups allow-popups-to-escape-sandbox; default-src 'none'; img-src * data:; style-src 'unsafe-inline' *; font-src * data:",
};

const contentDisposition = (fileName: string, download: boolean) =>
  `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(fileName)}`;

export const serveNewsletterFile = async (
  request: Request,
  newsletterId: string,
): Promise<Response> => {
  const organisation = await getCurrentOrganisation();
  if (!organisation) return new Response("Not found", { status: 404 });

  const member = await authorizeMember(organisation.id);
  if (!member) return new Response("Sign in to read this newsletter", { status: 401 });

  const file = await getNewsletterFile(organisation.id, newsletterId);
  // Subscribers only see published issues; the team can preview drafts.
  if (!file || (!isPublished(file.status) && !isTeamRole(member.role))) {
    return new Response("Not found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  return new Response(new Uint8Array(file.content), {
    headers: {
      "Content-Type": file.contentType === "text/html" ? "text/html; charset=utf-8" : file.contentType,
      "Content-Disposition": contentDisposition(file.fileName, download),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...(file.contentType === "text/html" ? HTML_SECURITY_HEADERS : {}),
    },
  });
};

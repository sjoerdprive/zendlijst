import { getDictionary } from "@/shared/i18n/server";
import { buttonClasses, Card } from "@/shared/ui";
import { createQrImages } from "../qr";
import type { ShareSubscribeCardProps } from "../types";
import { CopyLinkButton } from "./CopyLinkButton";

export const ShareSubscribeCard = async ({ url, slug, organisationName, mode }: ShareSubscribeCardProps) => {
  const [t, qr] = await Promise.all([getDictionary(), createQrImages(url)]);
  const modeHint = mode === "closed" ? t.share.closedHint : mode === "approval" ? t.share.approvalHint : null;
  return (
    <Card title={t.share.title} description={t.share.description}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimise */}
        <img
          src={qr.svg}
          alt={t.share.qrAlt(organisationName)}
          width={176}
          height={176}
          className="size-44 shrink-0 rounded-xl border border-line bg-white p-2"
        />
        <div className="min-w-0 space-y-3">
          <p className="break-all rounded-lg bg-surface-sunken px-3 py-2 font-mono text-sm">{url}</p>
          {modeHint && <p className="text-sm text-muted">{modeHint}</p>}
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={url} />
            <a href={qr.png} download={`${slug}-qr.png`} className={buttonClasses("secondary")}>
              {t.share.downloadPng}
            </a>
            <a href={qr.svg} download={`${slug}-qr.svg`} className={buttonClasses("ghost")}>
              {t.share.downloadSvg}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

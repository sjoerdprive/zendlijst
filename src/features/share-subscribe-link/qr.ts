import "server-only";
import QRCode from "qrcode";
import type { QrImages } from "./types";

const OPTIONS = {
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#1c2333", light: "#ffffff" },
} as const;

// Data URLs keep the QR code in the page (no extra route, nothing to inject).
export const createQrImages = async (url: string): Promise<QrImages> => {
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { ...OPTIONS, type: "svg" }),
    QRCode.toDataURL(url, { ...OPTIONS, width: 1024 }),
  ]);
  return { svg: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, png };
};

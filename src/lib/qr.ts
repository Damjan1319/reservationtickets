import QRCode from "qrcode";

export async function reservationQrDataUrl(token: string) {
  return QRCode.toDataURL(`ULZ:${token}`, {
    width: 360,
    margin: 2,
    color: {
      dark: "#141311",
      light: "#ece7de",
    },
    errorCorrectionLevel: "M",
  });
}

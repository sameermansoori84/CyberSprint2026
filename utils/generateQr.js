const QRCode = require("qrcode");

async function generateQrBuffer(text) {
  return QRCode.toBuffer(text, {
    type: "png",
    width: 300,
    errorCorrectionLevel: "H",
  });
}

module.exports = { generateQrBuffer };

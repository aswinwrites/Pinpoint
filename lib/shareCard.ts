/**
 * Share card generator — renders a premium canvas image with:
 * PinPoint branding, vehicle photo, QR code, coordinates, note.
 * Returns a PNG data URL.
 */
import type { ParkingSpot } from "@/types";
import { formatTimestamp, buildMapsLink, vehicleEmoji } from "./utils";

export async function generateShareCard(
  spot: ParkingSpot,
  distanceText?: string
): Promise<string> {
  const W = 800;
  const H = 500;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background gradient ──────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1a1a2e");
  grad.addColorStop(1, "#16213e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle grid pattern ─────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Accent bar top ───────────────────────────────────────────────────────
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, "#4f46e5");
  accentGrad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, W, 6);

  // ── Logo + brand ─────────────────────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("📍 PinPoint", 40, 60);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Never lose your vehicle again", 40, 84);

  // ── Divider ──────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(40, 100, W - 80, 1);

  // ── Vehicle photo (left column) ──────────────────────────────────────────
  const PHOTO_X = 40;
  const PHOTO_Y = 120;
  const PHOTO_W = 280;
  const PHOTO_H = 200;

  if (spot.photo) {
    try {
      const img = await loadImage(spot.photo);
      // Rounded rect clip
      roundRect(ctx, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H, 12);
      ctx.clip();
      ctx.drawImage(img, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H);
      ctx.restore();
      ctx.save();
    } catch {
      drawPhotoPlaceholder(ctx, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H, vehicleEmoji(spot.vehicleType));
    }
  } else {
    drawPhotoPlaceholder(ctx, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H, vehicleEmoji(spot.vehicleType));
  }

  // ── Info block (right of photo) ──────────────────────────────────────────
  const INFO_X = 360;
  let infoY = 130;

  // Vehicle type badge
  ctx.fillStyle = "rgba(79, 70, 229, 0.3)";
  roundRect(ctx, INFO_X, infoY - 20, 120, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${vehicleEmoji(spot.vehicleType)} ${spot.vehicleName || spot.vehicleType.toUpperCase()}`, INFO_X + 10, infoY - 1);

  infoY += 30;

  // Distance
  if (distanceText) {
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(distanceText, INFO_X, infoY + 26);
    infoY += 50;
  }

  // Timestamp
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("🕒 " + formatTimestamp(spot.timestamp), INFO_X, infoY + 16);
  infoY += 36;

  // Note
  if (spot.note) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("📝 " + truncate(spot.note, 36), INFO_X, infoY + 16);
    infoY += 36;
  }

  // Coordinates
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "12px monospace";
  ctx.fillText(`${spot.latitude.toFixed(6)}, ${spot.longitude.toFixed(6)}`, INFO_X, infoY + 16);

  // ── QR Code ──────────────────────────────────────────────────────────────
  const QR_SIZE = 120;
  const QR_X = W - QR_SIZE - 40;
  const QR_Y = 120;

  try {
    const QRCode = (await import("qrcode")).default;
    const qrDataUrl = await QRCode.toDataURL(buildMapsLink(spot.latitude, spot.longitude), {
      width: QR_SIZE * 2,
      margin: 1,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
    const qrImg = await loadImage(qrDataUrl);

    // White bg for QR
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, QR_X - 8, QR_Y - 8, QR_SIZE + 16, QR_SIZE + 16, 12);
    ctx.fill();

    ctx.drawImage(qrImg, QR_X, QR_Y, QR_SIZE, QR_SIZE);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan to navigate", QR_X + QR_SIZE / 2, QR_Y + QR_SIZE + 24);
    ctx.textAlign = "left";
  } catch {
    // QR generation failed — skip it
  }

  // ── Maps link ─────────────────────────────────────────────────────────────
  const mapLink = buildMapsLink(spot.latitude, spot.longitude);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(mapLink, 40, H - 48);

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(40, H - 36, W - 80, 1);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Shared via PinPoint • parkpin.app", 40, H - 14);

  const accentGrad2 = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad2.addColorStop(0, "#4f46e5");
  accentGrad2.addColorStop(1, "#7c3aed");
  ctx.fillStyle = accentGrad2;
  ctx.fillRect(0, H - 5, W, 5);

  return canvas.toDataURL("image/png");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  emoji: string
) {
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();

  ctx.font = "64px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + w / 2, y + h / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

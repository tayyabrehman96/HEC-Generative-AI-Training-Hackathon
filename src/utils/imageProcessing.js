/**
 * Sehat Saathi — Improved Image Processing Utility
 * Handles camera orientation and optimizes for OCR
 */

/**
 * Convert a File/Blob to base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process image: fix orientation, resize, and optimize for OCR
 */
export async function processImage(dataUrl, maxWidth = 2560, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => {
      reject(new Error('Image failed to load — try another JPG/PNG or take a new photo.'));
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Auto-Enhance for better OCR (increase contrast and sharpness)
      ctx.filter = 'contrast(1.4) brightness(1.1) saturate(1.2)';
      ctx.drawImage(img, 0, 0, width, height);

      // Return as JPEG for smaller payload
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

/**
 * Synthetic Rx image for “Try demo” — no external file needed; exercises the same OCR→VLM→LLM path.
 */
export function createDemoPrescriptionDataUrl() {
  const w = 920;
  const h = 720;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffef6';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic 32px Georgia, "Times New Roman", serif';
  ctx.fillText('Rx', 72, 88);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 108);
  ctx.lineTo(w - 64, 108);
  ctx.stroke();

  const lines = [
    'Duvadilan SR 40mg — جاری',
    'Tab. Hi-flux 50mg  w (7) — 1x1',
    'Tab. Bruvan N  w (20) — 1x1',
    'Inj. Abocet  (2)',
    'Tab. Eziday 50mg  O.D — ناشتہ',
    'Tab. Getamox 500mg  B.D — کھانے',
  ];
  ctx.font = '26px "Segoe UI", system-ui, sans-serif';
  let y = 168;
  for (const line of lines) {
    ctx.fillStyle = '#1e293b';
    ctx.fillText(line, 64, y);
    y += 52;
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Sehat Saathi — demo prescription (generated)', 64, h - 36);
  ctx.fillText('13/10/2025', w - 180, 56);

  return canvas.toDataURL('image/jpeg', 0.92);
}

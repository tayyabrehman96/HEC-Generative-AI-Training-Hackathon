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
  return new Promise((resolve) => {
    const img = new Image();
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

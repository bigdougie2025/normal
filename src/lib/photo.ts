const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;
const MIN_BRIGHTNESS = 40;
const MAX_BRIGHTNESS = 240;
const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.8;

export interface PhotoQualityResult {
  ok: boolean;
  message: string;
  brightness: number;
  width: number;
  height: number;
}

/**
 * Load a File/Blob into an HTMLImageElement.
 */
function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Calculate average brightness from image data (0-255).
 */
function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  // Sample every 10th pixel for speed
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Perceived brightness formula
    totalBrightness += (r * 299 + g * 587 + b * 114) / 1000;
  }

  return totalBrightness / (pixelCount / 10);
}

/**
 * Check photo quality (brightness and resolution).
 */
export async function checkPhotoQuality(file: Blob): Promise<PhotoQualityResult> {
  const img = await loadImage(file);
  const { width, height } = img;

  // Resolution check
  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    return {
      ok: false,
      message: 'Photo is too small. Please take a higher resolution photo.',
      brightness: 0,
      width,
      height,
    };
  }

  // Brightness check using a small sample canvas
  const sampleSize = 200;
  const canvas = document.createElement('canvas');
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const brightness = calculateBrightness(imageData);

  if (brightness < MIN_BRIGHTNESS) {
    return {
      ok: false,
      message: 'Photo is too dark. Move to a brighter area or turn on your torch.',
      brightness,
      width,
      height,
    };
  }

  if (brightness > MAX_BRIGHTNESS) {
    return {
      ok: false,
      message: 'Photo is too bright or washed out. Try moving away from direct light.',
      brightness,
      width,
      height,
    };
  }

  return { ok: true, message: '', brightness, width, height };
}

/**
 * Compress and resize a photo to JPEG, max 2048px on longest edge.
 */
export async function compressPhoto(file: Blob): Promise<Blob> {
  const img = await loadImage(file);
  let { width, height } = img;

  // Scale down if needed
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to compress photo'));
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

/**
 * Create a thumbnail data URL from a photo blob.
 */
export async function createThumbnail(file: Blob, size = 150): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Center crop
  const minDim = Math.min(img.width, img.height);
  const sx = (img.width - minDim) / 2;
  const sy = (img.height - minDim) / 2;
  ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 0.6);
}

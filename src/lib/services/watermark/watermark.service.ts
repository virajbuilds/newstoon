import { WatermarkConfig, defaultConfig } from './types';

class WatermarkService {
  private config: WatermarkConfig;
  private logoImage: HTMLImageElement | null = null;
  private readonly LOGO_URL = '/logo-watermark.png';

  constructor() {
    this.config = defaultConfig;
    if (typeof window !== 'undefined') {
      this.initializeLogo();
    }
  }

  private async initializeLogo() {
    try {
      this.logoImage = new Image();
      this.logoImage.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        if (!this.logoImage) return reject(new Error('Logo image not initialized'));
        this.logoImage.onload = resolve;
        this.logoImage.onerror = reject;
        this.logoImage.src = this.LOGO_URL;
      });
    } catch (error) {
      console.error('Failed to initialize logo:', error);
    }
  }

  async addWatermark(imageUrl: string): Promise<Blob> {
    if (!this.config.enabled) {
      const response = await fetch(imageUrl);
      return response.blob();
    }

    if (!this.logoImage) {
      await this.initializeLogo();
      if (!this.logoImage) {
        throw new Error('Logo not available');
      }
    }

    try {
      // Load the target image
      const image = new Image();
      image.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw main image
      ctx.drawImage(image, 0, 0);

      // Calculate watermark dimensions - doubled the max width from 150 to 300
      const watermarkWidth = Math.min(image.width * this.config.size, 300);
      const aspectRatio = this.logoImage.width / this.logoImage.height;
      const watermarkHeight = watermarkWidth / aspectRatio;

      // Position watermark
      const x = canvas.width - watermarkWidth - this.config.margin;
      const y = canvas.height - watermarkHeight - this.config.margin;

      // Set transparency
      ctx.globalAlpha = this.config.opacity;

      // Draw watermark
      ctx.drawImage(this.logoImage, x, y, watermarkWidth, watermarkHeight);

      // Reset transparency
      ctx.globalAlpha = 1;

      // Convert to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          },
          'image/png',
          1.0
        );
      });
    } catch (error) {
      console.error('Watermark service error:', error);
      throw error;
    }
  }
}

export const watermarkService = new WatermarkService();
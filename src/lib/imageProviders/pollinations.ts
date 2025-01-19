import { ImageProvider } from './types';
import { sleep } from '../utils';

export const pollinationsProvider: ImageProvider = {
  name: 'Pollinations',
  isEnabled: true,
  generateImage: async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
      throw new Error('Empty prompt provided for image generation');
    }

    try {
      const processedPrompt = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const enhancedPrompt = `editorial-cartoon-newspaper-style-${processedPrompt}`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true`;
      
      // Test if the URL is accessible with retries
      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(imageUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // Handle CORS issues
          });
          if (response.type === 'opaque' || response.ok) {
            return imageUrl;
          }
          await sleep(1000 * (i + 1)); // Exponential backoff
        } catch (retryError) {
          console.warn(`Pollinations retry ${i + 1} failed:`, retryError);
          if (i === 2) throw retryError;
          await sleep(1000 * (i + 1));
        }
      }

      throw new Error('Failed to generate image URL after retries');
    } catch (error) {
      console.error('Pollinations generation error:', error);
      throw new Error(
        error instanceof Error 
          ? `Pollinations generation failed: ${error.message}`
          : 'Failed to generate image with Pollinations'
      );
    }
  }
};
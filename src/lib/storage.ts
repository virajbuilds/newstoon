import { supabase } from './supabase';
import { sleep } from './utils';

export async function uploadImageToStorage(imageUrl: string, retries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Storage upload attempt ${attempt + 1}/${retries}`);

      // Fetch the image with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(imageUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'image/*, */*',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty image received');
      }

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `cartoon-${timestamp}-${random}.png`;
      const filePath = `cartoons/${filename}`;

      // Upload to Supabase Storage with retry
      const uploadResult = await retryOperation(
        () => supabase.storage.from('images').upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        }),
        3
      );

      if (uploadResult.error) throw uploadResult.error;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', filePath);
      return publicUrl;

    } catch (error) {
      console.error(`Storage upload attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to store image');
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation attempt ${i + 1} failed:`, error);
      lastError = error;
      if (i < maxRetries - 1) await sleep(delay * (i + 1));
    }
  }

  throw lastError;
}
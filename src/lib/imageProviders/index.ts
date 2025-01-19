import { ImageProvider, ImageGenerationResult } from './types';
import { dalleProvider } from './dalle';
import { pollinationsProvider } from './pollinations';
import { sleep, isValidImageUrl } from '../utils';

const providers: ImageProvider[] = [
  dalleProvider,
  pollinationsProvider
];

export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  const enabledProviders = providers.filter(p => p.isEnabled);
  
  if (enabledProviders.length === 0) {
    throw new Error('No image providers are currently enabled');
  }

  let lastError: Error | null = null;
  const maxRetries = 2;

  for (const provider of enabledProviders) {
    console.log(`Trying ${provider.name} provider...`);
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await provider.generateImage(prompt);
        
        // Verify the generated URL is valid
        if (await isValidImageUrl(url)) {
          console.log(`Successfully generated image with ${provider.name}`);
          return { url, provider: provider.name };
        }
        
        throw new Error('Generated URL validation failed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`${provider.name} attempt ${attempt + 1} failed:`, errorMessage);
        lastError = error instanceof Error ? error : new Error(errorMessage);
        
        // Check if we should retry with this provider
        if (attempt < maxRetries) {
          console.log(`Retrying ${provider.name} (attempt ${attempt + 2}/${maxRetries + 1})...`);
          await sleep(1000 * (attempt + 1));
          continue;
        }
        
        // Try next provider if available
        console.log(`All attempts with ${provider.name} failed, trying next provider...`);
        break;
      }
    }
  }

  // All providers failed
  const errorMessage = lastError?.message || 'All image providers failed';
  console.error('Final error:', errorMessage);
  throw new Error(errorMessage);
}
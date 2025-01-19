import OpenAI from 'openai';
import { ImageProvider } from './types';
import { uploadImageToStorage } from '../storage';
import { sleep } from '../utils';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
  timeout: 60000
});

// Safety filters for prompt enhancement
const safetyFilters = [
  { find: /(violence|gore|blood)/gi, replace: 'conflict' },
  { find: /(nude|naked|nsfw)/gi, replace: 'covered' },
  { find: /(weapon|gun|knife)/gi, replace: 'tool' },
  { find: /(kill|murder|dead)/gi, replace: 'defeat' },
  { find: /(hate|racist|discrimination)/gi, replace: 'bias' }
];

const enhancePromptSafety = (prompt: string): string => {
  let safePrompt = prompt;
  safetyFilters.forEach(filter => {
    safePrompt = safePrompt.replace(filter.find, filter.replace);
  });
  return `Create a simple editorial cartoon illustration showing: ${safePrompt}. Style: clean newspaper editorial cartoon style, minimal detail, clear visual message, black and white sketch style with minimal color accents. Keep it family-friendly and avoid any controversial or sensitive content.`;
};

const validateDALLEResponse = (response: any): void => {
  if (!response?.data?.[0]?.url) {
    throw new Error('Invalid DALL-E response format');
  }
};

export const dalleProvider: ImageProvider = {
  name: 'DALL-E',
  isEnabled: false,
  generateImage: async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
      throw new Error('Empty prompt provided for image generation');
    }

    let lastError: Error | null = null;
    const maxAttempts = 3;
    let enhancedPrompt = enhancePromptSafety(prompt);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`DALL-E attempt ${attempt}/${maxAttempts} with prompt:`, enhancedPrompt);

        // Generate image with DALL-E
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "natural",
          response_format: "url"
        });

        // Validate response
        validateDALLEResponse(response);
        const imageUrl = response.data[0].url;

        // Validate URL accessibility
        const urlCheck = await fetch(imageUrl, { 
          method: 'HEAD',
          headers: { Accept: 'image/*' }
        });

        if (!urlCheck.ok) {
          throw new Error(`URL validation failed: ${urlCheck.status}`);
        }

        // Upload to permanent storage
        const permanentUrl = await uploadImageToStorage(imageUrl, 2);
        console.log('DALL-E image generated and stored successfully');
        
        return permanentUrl;

      } catch (error: any) {
        console.error(`DALL-E attempt ${attempt} failed:`, error);
        lastError = error;

        // Handle specific error cases
        if (error?.response?.status === 429) {
          console.log('Rate limit hit, waiting longer before retry...');
          await sleep(2000 * attempt);
          continue;
        }

        if (error?.response?.status === 400) {
          // Content filter triggered - try with more sanitized prompt
          console.log('Content filter triggered, adjusting prompt...');
          enhancedPrompt = `Create a simple, family-friendly editorial cartoon showing: ${prompt}. Style: clean, minimal, non-controversial newspaper illustration.`;
          if (attempt < maxAttempts) {
            await sleep(1000 * attempt);
            continue;
          }
        }

        // For other errors, retry with backoff if attempts remain
        if (attempt < maxAttempts) {
          await sleep(1500 * attempt);
          continue;
        }
      }
    }

    // If all attempts failed
    const errorMessage = lastError instanceof Error 
      ? lastError.message
      : 'Unknown error occurred';
      
    throw new Error(`DALL-E generation failed after ${maxAttempts} attempts: ${errorMessage}`);
  }
};
import type { ShareConfig, SharePlatform } from './types';
import { WhatsAppProvider } from './providers/whatsapp';
import { TwitterProvider } from './providers/twitter';

class ShareService {
  private providers = {
    whatsapp: new WhatsAppProvider(),
    twitter: new TwitterProvider()
  };

  async share(config: ShareConfig, platform: SharePlatform = 'native'): Promise<boolean> {
    try {
      const provider = this.providers[platform];
      if (provider) {
        return await provider.share(config);
      }
      return false;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }
}

export const shareService = new ShareService();
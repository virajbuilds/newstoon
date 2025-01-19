import type { ShareProvider, ShareConfig } from '../types';
import { watermarkService } from '../../watermark';

export class TwitterProvider implements ShareProvider {
  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  private formatShareText(config: ShareConfig): string {
    const title = config.title.length > 100 ? config.title.substring(0, 97) + '...' : config.title;
    return `📰 "${title}"\n\n🔗 ${config.url}\n\n✨ via @News2oonAI`;
  }

  async share(config: ShareConfig): Promise<boolean> {
    try {
      const tweetText = this.formatShareText(config);
      const isMobile = this.isMobileDevice();

      if (config.image) {
        const file = await watermarkService.addWatermark(config.image);
        const shareData = {
          files: [file],
          text: tweetText
        };

        if (isMobile && navigator.share && navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
          return true;
        }

        // For web or mobile fallback
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Twitter share error:', error);
      return false;
    }
  }
}
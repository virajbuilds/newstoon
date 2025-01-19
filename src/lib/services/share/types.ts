export interface ShareConfig {
  url: string;
  title: string;
  text?: string;
  image?: string;
}

export type SharePlatform = 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'native';

export interface ShareProvider {
  share(config: ShareConfig): Promise<boolean>;
}
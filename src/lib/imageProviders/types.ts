export interface ImageProvider {
  name: string;
  generateImage: (prompt: string) => Promise<string>;
  isEnabled: boolean;
}

export interface ImageGenerationResult {
  url: string;
  provider: string;
}
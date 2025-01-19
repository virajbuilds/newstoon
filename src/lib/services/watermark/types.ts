export interface WatermarkConfig {
  enabled: boolean;
  opacity: number;
  size: number;
  margin: number;
}

export const defaultConfig: WatermarkConfig = {
  enabled: true,
  opacity: 1,
  size: 0.3,
  margin: 48
};
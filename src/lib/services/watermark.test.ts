import { watermarkService } from './watermark';

describe('WatermarkService', () => {
  const testImageUrl = 'https://picsum.photos/200/300';

  beforeEach(() => {
    // Mock canvas and context
    const mockContext = {
      drawImage: jest.fn(),
      globalAlpha: 1,
    };
    
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      toBlob: jest.fn().mockImplementation((callback) => callback(new Blob())),
      width: 200,
      height: 300,
    };

    global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
    // @ts-ignore
    global.HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob;
  });

  it('should add watermark to image', async () => {
    const result = await watermarkService.addWatermark(testImageUrl);
    expect(result).toBeInstanceOf(Blob);
  });

  it('should handle errors gracefully', async () => {
    const invalidUrl = 'https://invalid-url/image.jpg';
    await expect(watermarkService.addWatermark(invalidUrl)).rejects.toThrow();
  });
});
// Browser-based image processing utilities

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  autoOrient?: boolean;
  sharpen?: boolean;
  contrast?: number;
  brightness?: number;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageProcessor {
  static async preprocessImage(
    file: File, 
    options: ImageProcessingOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 85,
      format = 'jpeg'
    } = options;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const { width, height } = img;
            let newWidth = width;
            let newHeight = height;

            // Resize if needed
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              newWidth = Math.round(width * ratio);
              newHeight = Math.round(height * ratio);
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Apply image enhancements
            ctx.filter = 'contrast(110%) brightness(105%)';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const processedFile = new File([blob], file.name, {
                    type: `image/${format}`,
                    lastModified: Date.now()
                  });
                  resolve(processedFile);
                } else {
                  resolve(file);
                }
              },
              `image/${format}`,
              quality / 100
            );
          } catch (error) {
            console.error('Canvas processing error:', error);
            resolve(file);
          }
        };

        img.onerror = () => {
          console.error('Image load error');
          resolve(file);
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return file;
    }
  }

  static async validateImageFormat(file: File): Promise<boolean> {
    try {
      const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      return supportedFormats.includes(file.type);
    } catch (error) {
      return false;
    }
  }

  static async getImageMetadata(file: File): Promise<{width?: number; height?: number; size: number; type: string}> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };
      img.onerror = () => {
        resolve({
          size: file.size,
          type: file.type
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }
}
/**
 * Advanced image optimization utilities
 * Provides WebP/AVIF conversion, lazy loading, and responsive images
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  priority?: boolean;
}

export class ImageOptimizer {
  /**
   * Generate optimized image URL with multiple formats
   */
  static getOptimizedImageUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): {
    src: string;
    srcSet: string;
    sizes: string;
    formats: string[];
  } {
    const {
      width = 1200,
      height,
      quality = 80,
      format = 'webp',
      lazy = true,
      priority = false,
    } = options;

    // Generate responsive sizes
    const sizes = [640, 750, 828, 1080, 1200, 1920];
    const formats = ['webp', 'avif', 'jpeg']; // Fallback order

    // Create srcSet for different sizes
    const srcSet = sizes
      .map(size => {
        const optimizedUrl = this.addImageParams(originalUrl, {
          width: size,
          height: height ? Math.round((height * size) / width) : undefined,
          quality,
          format,
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');

    // Default src (largest size)
    const src = this.addImageParams(originalUrl, {
      width,
      height,
      quality,
      format,
    });

    return {
      src,
      srcSet,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      formats,
    };
  }

  /**
   * Add optimization parameters to image URL
   */
  private static addImageParams(
    url: string,
    params: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    }
  ): string {
    const urlObj = new URL(url);
    
    if (params.width) urlObj.searchParams.set('w', params.width.toString());
    if (params.height) urlObj.searchParams.set('h', params.height.toString());
    if (params.quality) urlObj.searchParams.set('q', params.quality.toString());
    if (params.format) urlObj.searchParams.set('f', params.format);
    
    return urlObj.toString();
  }

  /**
   * Generate preload links for critical images
   */
  static generatePreloadLinks(images: Array<{
    url: string;
    as: 'image';
    type?: string;
    media?: string;
  }>): string {
    return images
      .map(img => {
        const link = `<link rel="preload" as="${img.as}" href="${img.url}"`;
        const type = img.type ? ` type="${img.type}"` : '';
        const media = img.media ? ` media="${img.media}"` : '';
        return `${link}${type}${media}>`;
      })
      .join('\n');
  }

  /**
   * Check if image format is supported by browser
   */
  static getSupportedFormat(): 'avif' | 'webp' | 'jpeg' {
    if (typeof window === 'undefined') return 'jpeg';
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }
    
    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }
    
    return 'jpeg';
  }

  /**
   * Generate responsive image component props
   */
  static getResponsiveImageProps(
    originalUrl: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ) {
    const optimized = this.getOptimizedImageUrl(originalUrl, options);
    
    return {
      src: optimized.src,
      alt,
      srcSet: optimized.srcSet,
      sizes: optimized.sizes,
      loading: options.lazy ? 'lazy' : 'eager',
      fetchPriority: options.priority ? 'high' : 'auto',
      // Add modern image formats
      style: {
        contentVisibility: 'auto',
        containIntrinsicSize: '1200px 675px', // Default aspect ratio
      },
    };
  }
}

/**
 * Lazy loading utility for images
 */
export class LazyLoader {
  private static observer: IntersectionObserver | null = null;

  static init() {
    if (typeof window === 'undefined') return;
    
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  static observe(img: HTMLImageElement) {
    this.init();
    this.observer?.observe(img);
  }
}

/**
 * Image compression utility
 */
export class ImageCompressor {
  /**
   * Compress image on client side
   */
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'webp' | 'jpeg';
    } = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

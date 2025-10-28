export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  targetFormat?: 'webp' | 'jpeg' | 'png'
  maxSizeKB?: number
}

export const compressImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    targetFormat = 'webp',
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    // 이미 충분히 작은 파일은 WebP 변환만 수행
    if (file.size < maxSizeKB * 1024 && targetFormat === file.type.split('/')[1]) {
      resolve(file)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // 원본 크기
        let { width, height } = img

        // 비율 유지하며 리사이징
        const aspectRatio = width / height

        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }

        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }

        // Canvas 크기 설정
        canvas.width = width
        canvas.height = height

        // 이미지 그리기 (고품질 설정)
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
        }

        // MIME 타입 결정
        const mimeType = targetFormat === 'webp' ? 'image/webp' :
                        targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png'

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다'))
              return
            }

            const extension = targetFormat === 'webp' ? 'webp' : 
                             targetFormat === 'jpeg' ? 'jpg' : 'png'
            
            const compressedFile = new File(
              [blob],
              `compressed_${file.name.replace(/\.[^/.]+$/, '')}.${extension}`,
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            )

            console.log(`이미지 압축 완료: ${file.size} bytes → ${compressedFile.size} bytes (${Math.round((1 - compressedFile.size / file.size) * 100)}% 감소)`)
            
            resolve(compressedFile)
          },
          mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다'))
    }

    // 이미지 로드
    img.src = URL.createObjectURL(file)
  })
}

// 브라우저 WebP 지원 확인
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => resolve(webP.height === 2)
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

// 스마트 압축 (웹 최적화된 고압축 설정)
export const smartCompressImage = async (file: File): Promise<File> => {
  const webpSupported = await supportsWebP()
  
  return compressImage(file, {
    maxWidth: 1200,  // 1920 → 1200 (웹에 충분한 해상도)
    maxHeight: 800,  // 1080 → 800 (모바일도 고려)
    quality: 0.7,    // 0.85 → 0.7 (품질 약간 낮춤, 압축률 대폭 증가)
    targetFormat: webpSupported ? 'webp' : 'jpeg',
    maxSizeKB: 300   // 800KB → 300KB (더 공격적인 압축)
  })
}

// 압축 프리셋 정의 (웹 최적화)
export const COMPRESSION_PRESETS = {
  thumbnail: { maxWidth: 300, maxHeight: 300, quality: 0.6, targetFormat: 'webp' as const },
  medium: { maxWidth: 800, maxHeight: 600, quality: 0.7, targetFormat: 'webp' as const },
  high: { maxWidth: 1200, maxHeight: 800, quality: 0.75, targetFormat: 'webp' as const },
  original: { maxWidth: 1600, maxHeight: 1200, quality: 0.8, targetFormat: 'webp' as const }
}

// 프리셋을 사용한 압축
export const compressImageWithPreset = async (
  file: File,
  preset: keyof typeof COMPRESSION_PRESETS
): Promise<File> => {
  return compressImage(file, COMPRESSION_PRESETS[preset])
}

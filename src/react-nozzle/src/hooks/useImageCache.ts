import { useState, useCallback, useEffect, useRef } from 'react'

const CACHE_PREFIX = 'IMAGE_CACHE'

export interface CachedImage {
  name: string
  src: string
}

/**
 * A React hook to cache multiple local image files (selected by the user)
 * in localStorage for prototyping. Caches based on filename only.
 *
 * @returns {object} An object containing:
 *  - images: Array of cached images with their names and sources
 *  - isLoading: Boolean indicating if any file is currently being read
 *  - error: Any error object encountered
 *  - processAndCacheFile: Function to process a File object, display it, and cache it
 *  - clearCachedImageByName: Function to remove an image from cache by its filename
 *  - clearAllCachedImages: Function to remove all images cached by this hook
 */
export function useImageCache() {
  const [images, setImages] = useState<CachedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    // Load all cached images from localStorage on mount
    try {
      const cachedImages: CachedImage[] = []
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const imageName = key.slice(CACHE_PREFIX.length)
          const imageSrc = localStorage.getItem(key)
          if (imageSrc) {
            cachedImages.push({ name: imageName, src: imageSrc })
          }
        }
      })
      if (isMounted.current) {
        setImages(cachedImages)
      }
    } catch (e) {
      console.warn('useImageCache: Failed to load cached images from localStorage.', e)
    }

    return () => {
      isMounted.current = false
    }
  }, [])

  const processAndCacheFile = useCallback((file: File) => {
    if (!file || !(file instanceof File)) {
      if (isMounted.current) {
        setIsLoading(false)
      }
      return
    }

    if (isMounted.current) {
      setIsLoading(true)
    }

    const cacheKey = CACHE_PREFIX + file.name

    // 1. Try to load from localStorage
    try {
      const cachedImage = localStorage.getItem(cacheKey)
      if (cachedImage) {
        if (isMounted.current) {
          setImages(prevImages => {
            // Check if image already exists in state
            const exists = prevImages.some(img => img.name === file.name)
            if (exists) return prevImages
            return [...prevImages, { name: file.name, src: cachedImage }]
          })
          setIsLoading(false)
        }
        console.log('Found in cache')
        return // Found in cache
      }
    } catch (e) {
      console.warn('useImageCache: Failed to access localStorage.', e)
    }

    // 2. Not in cache, so read the file and cache it
    const reader = new FileReader()
    reader.onloadend = () => {
      if (isMounted.current) {
        const base64data = reader.result as string
        try {
          localStorage.setItem(cacheKey, base64data)
        } catch (storageError) {
          console.warn(`useImageCache: Failed to save to localStorage for ${file.name}.`, storageError)
          // Still display the image even if caching fails
        }
        setImages(prevImages => {
          // Check if image already exists in state
          const exists = prevImages.some(img => img.name === file.name)
          if (exists) return prevImages
          return [...prevImages, { name: file.name, src: base64data }]
        })
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      if (isMounted.current) {
        console.error(`useImageCache: FileReader error for ${file.name}`, reader.error)
        setIsLoading(false)
      }
    }

    reader.readAsDataURL(file)
  }, [])

  const clearCachedImageByName = useCallback((fileName: string) => {
    if (!fileName) return
    const cacheKey = CACHE_PREFIX + fileName
    try {
      localStorage.removeItem(cacheKey)
      setImages(prevImages => prevImages.filter(img => img.name !== fileName))
    } catch (e) {
      console.warn(`useImageCache: Failed to remove ${fileName} from localStorage.`, e)
    }
  }, [])

  const clearAllCachedImages = useCallback(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      if (isMounted.current) {
        setImages([])
        setIsLoading(false)
      }
    } catch (e) {
      console.warn('useImageCache: Failed to clear all images.', e)
    }
  }, [])

  return {
    images,
    isLoading,
    processAndCacheFile,
    clearCachedImageByName,
    clearAllCachedImages,
  }
}

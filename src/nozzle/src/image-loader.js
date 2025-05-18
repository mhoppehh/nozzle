/**
 * A class for loading multiple images asynchronously.
 */
export class ImageLoader {
  /**
   * @param {string[]} [srcArray=[]] - An optional array of initial image source URLs to load.
   */
  constructor(srcArray = []) {
    if (!Array.isArray(srcArray)) {
      throw new Error('ImageLoader constructor expects an array of source URLs.')
    }
    this.srcArray = [...srcArray] // Use spread to create a copy
    this.loadedImages = []
    this.loadingError = null
    this.isLoading = false // Flag to indicate if loading is in progress
  }

  /**
   * Adds an additional image source URL to the list of images to be loaded.
   * This does NOT automatically trigger a new load. You need to call load()
   * again to load the newly added image(s).
   *
   * @param {string} src - The image source URL to add.
   */
  addImages(srcArray) {
    if (!Array.isArray(srcArray)) {
      console.warn('ImageLoader: Invalid array of source URLs')
      return
    }
    srcArray.forEach(src => {
      // Avoid adding duplicates
      if (!this.srcArray.includes(src)) {
        this.srcArray.push(src)
        // Reset loaded images and error if new images are added after loading
        // has potentially completed. This prepares for a new load.
        if (!this.isLoading && this.loadedImages.length > 0) {
          console.warn('ImageLoader: Added new image source after previous load. Call load() again to load.')
          this.loadedImages = []
          this.loadingError = null
        }
      } else {
        console.warn(`ImageLoader: Source "${src}" is already in the list.`)
      }
    })
  }

  /**
   * Starts the image loading process for all currently listed image sources.
   * If called while loading is in progress, it will effectively wait for the
   * current load to finish and then potentially start a new one if sources
   * were added during the process (though typically you'd add all sources
   * before the final load call).
   *
   * @returns {Promise<HTMLImageElement[]>} A Promise that resolves with an array of loaded Image objects.
   *                                      Rejects if any image fails to load.
   */
  load() {
    if (this.isLoading) {
      console.warn('ImageLoader: Load already in progress.')
      // You could potentially return the current loading promise here if desired,
      // but for simplicity, we'll just log a warning.
      // Returning a new promise that resolves when loading is done is more complex
      // if sources were added mid-load. Sticking to a clear load boundary is better.
      return Promise.reject(new Error('Load already in progress.'))
    }

    if (this.srcArray.length === 0) {
      console.warn('ImageLoader: No image sources to load.')
      this.loadedImages = [] // Ensure loadedImages is reset
      this.loadingError = null
      return Promise.resolve([]) // Resolve with an empty array if no sources
    }

    this.isLoading = true
    this.loadedImages = [] // Clear previously loaded images before a new load
    this.loadingError = null // Clear previous errors

    const imagePromises = this.srcArray.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          resolve(img)
        }

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${src}`))
        }

        img.src = src // Start loading
      })
    })

    return Promise.all(imagePromises)
      .then(images => {
        this.loadedImages = images
        this.loadingError = null // Ensure error is null on success
        this.isLoading = false
        return images // Resolve the promise with the loaded images
      })
      .catch(error => {
        this.loadingError = error
        this.loadedImages = [] // Clear loaded images on error
        this.isLoading = false
        throw error // Re-throw the error
      })
  }

  /**
   * Returns the array of loaded images after the load() promise has resolved successfully.
   * Returns an empty array if load() hasn't been called or completed successfully.
   * @returns {HTMLImageElement[]} An array of loaded Image objects.
   */
  getImages() {
    return this.loadedImages
  }

  /**
   * Returns the error that occurred during the most recent loading attempt, if any.
   * Returns null if no error occurred or loading hasn't started/finished successfully.
   * @returns {Error | null} The loading error, or null.
   */
  getError() {
    return this.loadingError
  }

  /**
   * Checks if the loader is currently in the process of loading images.
   * @returns {boolean} True if loading is in progress, false otherwise.
   */
  isLoadinɡ() {
    return this.isLoading
  }
}

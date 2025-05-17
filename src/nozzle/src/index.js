// canvasDrawer.js

class CanvasDrawer {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
   */
  constructor(canvas) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas element provided.')
    }
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    // State variables
    this.canvasHistory = [] // Stores strokes
    this.brushMode = false
    this.showGrid = true
    this.gridSize = 20
    this.isDrawing = false
    this.lastT = 0 // Time of last point
    this.lastX = 0 // X coordinate of last point
    this.lastY = 0 // Y coordinate of last point
    this.imageId = null

    // Rolling average settings for brush smoothing
    this.bufferSize = 20
    this.distanceBuffer = new Array(this.bufferSize).fill(0)
    this.pointBuffer = new Array(this.bufferSize).fill({ x: 0, y: 0 }) // Stores recent points
    this.bufferIndex = 0

    // Brush settings
    this.circlesPerPixel = 0.1 // Number of circles per pixel of line length

    // Initialize canvas settings
    this._init()
  }

  /**
   * Internal initialization method.
   */
  _init() {
    // Set initial canvas style
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    // Draw initial grid if needed
    if (this.showGrid) {
      this._drawGrid()
      console.log('showing grid')
    }
  }

  /**
   * Internal method to draw the grid.
   */
  _drawGrid() {
    this.ctx.strokeStyle = '#ddd'
    this.ctx.lineWidth = 0.5

    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }

    // Reset stroke style
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
  }

  /**
   * Internal method to draw a line segment.
   * @param {number} x - The x-coordinate of the end point.
   * @param {number} y - The y-coordinate of the end point.
   */
  _drawLine(x, y) {
    this.ctx.beginPath()
    this.ctx.moveTo(this.lastX, this.lastY)
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
  }

  /**
   * Internal method to draw using the brush mode (circles).
   * @param {number} x - The x-coordinate of the current point.
   * @param {number} y - The y-coordinate of the current point.
   */
  _drawBrush(x, y) {
    const currentD = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2)
    const avgDistanceLast = this.distanceBuffer.reduce((a, b) => a + b, 0) / this.bufferSize

    // Add current distance and point to buffers
    this.distanceBuffer[this.bufferIndex] = currentD
    this.pointBuffer[this.bufferIndex] = { x: x, y: y }
    this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize

    const avgDistance = this.distanceBuffer.reduce((a, b) => a + b, 0) / this.bufferSize

    const numCircles = Math.max(1, Math.floor(currentD * this.circlesPerPixel))

    // Draw circles along the line segment
    for (let i = 0; i <= numCircles; i++) {
      const t = i / numCircles
      const circleX = this.lastX + (x - this.lastX) * t
      const circleY = this.lastY + (y - this.lastY) * t

      // Calculate radius based on interpolated average distance
      const r = ((avgDistance - avgDistanceLast) / numCircles) * i + avgDistanceLast

      this.ctx.beginPath()
      this.ctx.ellipse(circleX, circleY, r, r, 0, 0, 2 * Math.PI)
      this.ctx.stroke()
    }
    // Note: The original code had a comment about using pointBuffer for angle-based offsetting,
    // but the current implementation uses it for average distance calculation for radius.
    // This refactoring preserves the existing logic.
  }
  _drawImage(x, y) {
    const currentD = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2)
    const avgDistanceLast = this.distanceBuffer.reduce((a, b) => a + b, 0) / this.bufferSize

    // Add current distance and point to buffers
    this.distanceBuffer[this.bufferIndex] = currentD
    this.pointBuffer[this.bufferIndex] = { x: x, y: y }
    this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize

    const avgDistance = this.distanceBuffer.reduce((a, b) => a + b, 0) / this.bufferSize

    const numCircles = Math.max(1, Math.floor(currentD * this.circlesPerPixel))

    // Draw circles along the line segment
    for (let i = 0; i <= numCircles; i++) {
      const t = i / numCircles
      const circleX = this.lastX + (x - this.lastX) * t
      const circleY = this.lastY + (y - this.lastY) * t

      // Calculate radius based on interpolated average distance
      const r = ((avgDistance - avgDistanceLast) / numCircles) * (i + avgDistanceLast)

      const img = document.getElementById(this.imageId)

      this.ctx.drawImage(img, circleX - 100, circleY - 100, 200, 200)
    }
  }

  /**
   * Clears the entire canvas and the drawing history.
   */
  clear() {
    this.canvasHistory = [] // Clear history
    this._clearCanvas()
  }

  /**
   * Internal method to clear the canvas and redraw the grid if needed.
   */
  _clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.showGrid) {
      this._drawGrid()
    }
  }

  /**
   * Toggles the visibility of the grid.
   */
  toggleGrid() {
    this.showGrid = !this.showGrid
    this._clearCanvas() // Redraw canvas with/without grid
  }

  /**
   * Sets the drawing mode to brush or line.
   * @param {boolean} enabled - True for brush mode, false for line mode.
   */
  setBrushMode(enabled) {
    this.brushMode = enabled

    if (enabled) {
      this.ctx.filter = 'invert(1) opacity(10%)'
    } else {
      this.ctx.filter = 'invert(0) opacity(100%)'
    }
  }

  /**
   * Gets the current drawing mode.
   * @returns {boolean} True if brush mode is enabled, false otherwise.
   */
  getBrushMode() {
    return this.brushMode
  }

  setBrushImage(id) {
    this.imageId = id
  }

  /**
   * Handles the start of a drawing stroke (e.g., on mousedown or touchstart).
   * @param {object} point - An object with x and y coordinates (e.g., from event.offsetX/Y).
   */
  startDrawing(point) {
    this.isDrawing = true
    ;[this.lastX, this.lastY] = [point.x, point.y]
    this.canvasHistory.push([{ x: this.lastX, y: this.lastY, t: 0 }])
    this.lastT = Date.now()

    // Reset buffer when starting new stroke
    this.distanceBuffer.fill(0)
    this.bufferIndex = 0

    this.pointBuffer.fill({ x: point.x, y: point.y })
  }

  /**
   * Handles the continuation of a drawing stroke (e.g., on mousemove or touchmove).
   * @param {object} point - An object with x and y coordinates (e.g., from event.offsetX/Y).
   */
  draw(point) {
    if (!this.isDrawing) return

    if (this.brushMode) {
      this._drawImage(point.x, point.y)
      // this._drawBrush(point.x, point.y);
    } else {
      this._drawLine(point.x, point.y)
    }

    // Update history
    this.canvasHistory[this.canvasHistory.length - 1].push({
      x: point.x,
      y: point.y,
      t: Date.now() - this.canvasHistory[this.canvasHistory.length - 1][0].t,
    })
    ;[this.lastX, this.lastY] = [point.x, point.y]
  }

  /**
   * Handles the end of a drawing stroke (e.g., on mouseup, mouseout, touchend).
   */
  stopDrawing() {
    this.isDrawing = false
  }

  getIsDrawing() {
    return this.isDrawing
  }

  // Optional: Method to redraw history (for undo/redo or loading)
  // Note: This basic implementation doesn't fully support redrawing brush strokes
  // or different styles per stroke. History would need to store more context.
  redrawHistory() {
    this._clearCanvas() // Start with a clean canvas
    this.canvasHistory.forEach(stroke => {
      if (stroke.length > 0) {
        // Save current context state before drawing stroke
        this.ctx.save()
        // You would ideally restore stroke properties here if stored in history
        // e.g., this.ctx.strokeStyle = stroke.color;
        // e.g., this.ctx.lineWidth = stroke.lineWidth;

        this.ctx.beginPath()
        this.ctx.moveTo(stroke[0].x, stroke[0].y)
        for (let i = 1; i < stroke.length; i++) {
          // For line mode, just draw lines
          // For brush mode, you'd need to re-run the brush logic for each segment,
          // which is complex without storing brush-specific state per point/segment.
          this.ctx.lineTo(stroke[i].x, stroke[i].y)
        }
        this.ctx.stroke()

        // Restore context state
        this.ctx.restore()
      }
    })
    console.warn('redrawHistory is a basic implementation and may not perfectly redraw brush strokes or varied styles.')
  }
}

export default CanvasDrawer

// src/nozzle/index.d.ts

declare class CanvasDrawer {
  constructor(canvas: HTMLCanvasElement)
  clear(): void
  toggleGrid(): void
  setBrushMode(enabled: boolean): void
  getBrushMode(): boolean
  setBrushImage(id: string): void
  startDrawing(point: { x: number; y: number }): void
  draw(point: { x: number; y: number }): void
  stopDrawing(): void
  getIsDrawing(): boolean
  redrawHistory(): void
}

export default CanvasDrawer

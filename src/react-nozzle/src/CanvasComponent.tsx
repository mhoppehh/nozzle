import { useRef, useEffect, ChangeEvent } from 'react'

import './App.css'
import CanvasDrawer from '../../nozzle/src'
import { CachedImage, useImageCache } from './hooks/useImageCache'
import {
  BrushMenu,
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components'
import { cn } from './lib/utils'

const CanvasComponent = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawerRef = useRef<CanvasDrawer | null>(null)

  const { images, isLoading, processAndCacheFile } = useImageCache()

  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.setBrushImages(images.map(image => image.src))
    }
  }, [isLoading, images])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current

    if (canvas && container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      const drawer = new CanvasDrawer(canvas)
      drawerRef.current = drawer

      drawerRef.current.setBrushImages(images.map(image => image.src))

      const handleMouseDown = (e: MouseEvent) => {
        drawer.startDrawing({
          x: e.offsetX,
          y: e.offsetY,
        })
        drawer.draw({ x: e.offsetX, y: e.offsetY })
      }

      const handleMouseMove = (e: MouseEvent) => {
        drawer.draw({ x: e.offsetX, y: e.offsetY })
      }

      const handleMouseUp = () => {
        drawer.stopDrawing()
      }

      const handleMouseOut = () => {
        drawer.stopDrawing()
      }

      const handleResize = () => {
        if (container) {
          canvas.width = container.clientWidth
          canvas.height = container.clientHeight - 2
          if (drawerRef.current) {
            drawerRef.current.toggleGrid()
            drawerRef.current.toggleGrid()
          }
        }
      }

      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseup', handleMouseUp)
      canvas.addEventListener('mouseout', handleMouseOut)
      window.addEventListener('resize', handleResize)

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseup', handleMouseUp)
        canvas.removeEventListener('mouseout', handleMouseOut)
        window.removeEventListener('resize', handleResize)
        // No explicit destroy method in CanvasDrawer, but if there were, call it here.
      }
    }
  }, [])

  const handleClearClick = () => {
    if (drawerRef.current) {
      drawerRef.current.clear()
    }
  }

  const handleToggleGridClick = () => {
    if (drawerRef.current) {
      drawerRef.current.toggleGrid()
    }
  }

  const handleToggleBrushModeClick = (value: string) => {
    if (drawerRef.current) {
      drawerRef.current.setBrushMode(value !== 'pen')
      if (value !== 'pen') drawerRef.current.setBrushImage(value)
    }
  }

  const updateImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      processAndCacheFile(file)
    }
  }

  return (
    <div className='w-full h-full' ref={containerRef}>
      <canvas className='w-full h-full' ref={canvasRef}></canvas>
      <div
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-50', // Positioning: fixed, bottom, centered
          'flex items-center gap-1 p-3', // Layout: flex, items centered, small gap, padding
          'bg-background text-foreground', // Colors: theme background and text
          'border border-border', // Border: theme border color
          'rounded-lg', // Rounded corners: large rounding
          'shadow-lg', // Shadow: large shadow for elevation
        )}
      >
        <Input type='file' onChange={updateImage} id='file_input' />
        {images.map((image: CachedImage) => {
          return <BrushMenu drawerRef={drawerRef} image={image} />
        })}
        <Button variant='destructive' onClick={handleClearClick}>
          Clear Canvas
        </Button>
        <Button onClick={handleToggleGridClick}>Toggle Grid</Button>
        <Select onValueChange={handleToggleBrushModeClick} defaultValue='pen'>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select a fruit' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='pen'>Pen</SelectItem>
              {images.map((image: CachedImage) => {
                return (
                  <SelectItem key={image.name} value={image.src}>
                    {image.name}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default CanvasComponent

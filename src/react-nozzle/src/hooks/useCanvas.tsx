import { RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react'
import CanvasDrawer from '../../../nozzle/src'

interface CanvasElement extends HTMLCanvasElement {
  clear: () => void
  toggleGrid: () => void
  getBrushMode: () => boolean
  setBrushMode: (mode: boolean) => void
}

export const CanvasComponent2 = (props, ref: RefObject<CanvasElement>) => {
  const drawerRef = useRef<CanvasDrawer>(new CanvasDrawer(ref.current))

  const [brushMode, setIsBrushMode] = useState(true)

  useImperativeHandle(ref, () => ({}))

  return <div>Current Value: {count}</div>
}

const useCanvas = () => {
  const ref = useRef<CanvasElement | null>(null)

  const [brushMode, setIsBrushMode] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current

    if (canvas && container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      const drawer = new CanvasDrawer(canvas)
      drawerRef.current = drawer

      setIsBrushMode(drawer.getBrushMode())
    }
  }, [])

  const handleClearClick = () => {
    if (ref.current) {
      ref.current.clear()
    }
  }

  const handleToggleGridClick = () => {
    if (ref.current) {
      ref.current.toggleGrid()
    }
  }

  const handleToggleBrushModeClick = () => {
    if (ref.current) {
      const newMode = !ref.current.getBrushMode()
      ref.current.setBrushMode(newMode)
      setIsBrushMode(newMode)
    }
  }

  return {
    ref,
    handleClearClick,
    handleToggleGridClick,
    handleToggleBrushModeClick,
    brushMode,
  }
}

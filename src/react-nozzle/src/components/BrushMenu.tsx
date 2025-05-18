import { useState } from 'react'
import { Pin } from 'lucide-react'

import { CachedImage } from '@/hooks/useImageCache'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import CanvasDrawer from '../../../nozzle/src'
import { Toggle } from './ui/toggle'

interface BrushMenuProps {
  image: CachedImage
  drawerRef: React.RefObject<CanvasDrawer | null>
}

interface BrushSettings {
  opacity: number
  invert: number
  width: number
  height: number
}

const defaultBrushSettings: BrushSettings = {
  opacity: 50,
  invert: 0,
  width: 40,
  height: 40,
}

export function BrushMenu({ image, drawerRef }: BrushMenuProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(defaultBrushSettings)
  const [pin, setPin] = useState<boolean>(false)
  const { opacity, invert, width, height } = brushSettings

  const brushFilters = `invert(${invert}%) opacity(${opacity}%)`

  function onBrushSettingsHandler(newSettings: BrushSettings) {
    setBrushSettings(newSettings)
    if (drawerRef.current) drawerRef.current.setBrushFilters(brushFilters)
  }

  function onOpenChangeHandler(open: boolean) {
    if (!open && pin) return

    setOpen(open)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChangeHandler}>
      <PopoverTrigger asChild>
        <Button variant='outline'>{image.name}</Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' hideWhenDetached={false}>
        <div className='absolute top-1 right-1'>
          <Toggle onClick={() => setPin(!pin)} variant='outline' aria-label='Toggle pin'>
            <Pin className='h-4 w-4' />
          </Toggle>
        </div>
        <div className='grid gap-4'>
          <img
            key={image.name}
            src={image.src}
            id={image.name}
            style={{
              filter: brushFilters,
            }}
          />
          <div className='grid gap-2'>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Opacity</Label>
              <Slider
                onValueChange={value => {
                  onBrushSettingsHandler({ ...brushSettings, opacity: value[0] })
                }}
                defaultValue={[opacity]}
                step={1}
                className='col-span-2 h-8'
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Invert</Label>
              <Slider
                onValueChange={value => {
                  onBrushSettingsHandler({ ...brushSettings, invert: value[0] })
                }}
                defaultValue={[invert]}
                step={1}
                className='col-span-2 h-8'
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Width</Label>
              <Slider
                onValueChange={value => {
                  onBrushSettingsHandler({ ...brushSettings, width: value[0] })
                }}
                defaultValue={[width]}
                step={1}
                min={5}
                max={200}
                className='col-span-2 h-8'
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Height</Label>
              <Slider
                onValueChange={value => {
                  onBrushSettingsHandler({ ...brushSettings, height: value[0] })
                }}
                defaultValue={[height]}
                step={1}
                min={5}
                max={200}
                className='col-span-2 h-8'
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

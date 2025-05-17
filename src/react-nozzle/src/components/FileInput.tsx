import { ChangeEvent, useRef, useState } from 'react'

export function CustomFileInput({ accept = 'image/*' }) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setImageFile(file)
    }
  }

  return (
    <div className={'container'}>
      {imageFile ? (
        <img src={URL.createObjectURL(imageFile)} alt='Uploaded' />
      ) : (
        <span>Choose file or drag it here</span>
      )}
      <input ref={fileInputRef} type='file' accept={accept} style={{ display: 'none' }} onChange={updateImage} />
    </div>
  )
}

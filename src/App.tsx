import { useState, useRef, useEffect } from 'react'
import { Button } from '/components/ui/button'
import { Input } from '/components/ui/input'
import { Label } from '/components/ui/label'

const products = {
  "C1012 Glacier White": `${process.env.PUBLIC_URL}/product_images/C1012.jpg`,
  "C1026 Polar": `${process.env.PUBLIC_URL}/product_images/C1026.jpg`,
  "C3269 Ash Grey": `${process.env.PUBLIC_URL}/product_images/C3269.jpg`,
  "C3168 Silver Wave": `${process.env.PUBLIC_URL}/product_images/C3168.jpg`,
  "C1005 Milky White": `${process.env.PUBLIC_URL}/product_images/C1005.jpg`,
  "C2103 Onyx Carrara": `${process.env.PUBLIC_URL}/product_images/C2103.jpg`,
  "C2104 Massa": `${process.env.PUBLIC_URL}/product_images/C2104.jpg`,
  "C3105 Casla Cloudy": `${process.env.PUBLIC_URL}/product_images/C3105.jpg`,
  "C3146 Casla Nova": `${process.env.PUBLIC_URL}/product_images/C3146.jpg`,
  "C2240 Marquin": `${process.env.PUBLIC_URL}/product_images/C2240.jpg`,
  "C2262 Concrete (Honed)": `${process.env.PUBLIC_URL}/product_images/C2262.jpg`,
  "C3311 Calacatta Sky": `${process.env.PUBLIC_URL}/product_images/C3311.jpg`,
  "C3346 Massimo": `${process.env.PUBLIC_URL}/product_images/C3346.jpg`,
  "C4143 Mario": `${process.env.PUBLIC_URL}/product_images/C4143.jpg`,
  "C4145 Marina": `${process.env.PUBLIC_URL}/product_images/C4145.jpg`,
  "C4202 Calacatta Gold": `${process.env.PUBLIC_URL}/product_images/C4202.jpg`,
  "C1205 Casla Everest": `${process.env.PUBLIC_URL}/product_images/C1205.jpg`,
  "C4211 Calacatta Supreme": `${process.env.PUBLIC_URL}/product_images/C4211.jpg`,
  "C4204 Calacatta Classic": `${process.env.PUBLIC_URL}/product_images/C4204.jpg`,
  "C1102 Super White": `${process.env.PUBLIC_URL}/product_images/C1102.jpg`,
  "C4246 Casla Mystery": `${process.env.PUBLIC_URL}/product_images/C4246.jpg`,
  "C4345 Oro": `${process.env.PUBLIC_URL}/product_images/C4345.jpg`,
  "C4346 Luxe": `${process.env.PUBLIC_URL}/product_images/C4346.jpg`,
  "C4342 Casla Eternal": `${process.env.PUBLIC_URL}/product_images/C4342.jpg`,
  "C4221 Athena": `${process.env.PUBLIC_URL}/product_images/C4221.jpg`,
  "C4255 Calacatta Extra": `${process.env.PUBLIC_URL}/product_images/C4255.jpg`,
};

export default function ImageGenerationApp() {
  const [image, setImage] = useState<File | null>(null)
  const [mask, setMask] = useState<string | null>(null)
  const [product, setProduct] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [brushSize, setBrushSize] = useState(5)
  const [drawing, setDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number }>({ width: 400, height: 400 })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedImage = event.target.files?.[0]
    if (uploadedImage) {
      setImage(uploadedImage)
      const img = new Image()
      img.src = URL.createObjectURL(uploadedImage)
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height })
      }
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setLastX(event.clientX - rect.left)
      setLastY(event.clientY - rect.top)
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = 'black'
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(x, y)
        ctx.stroke()
        setLastX(x)
        setLastY(y)
      }
    }
  }

  const handleMouseUp = () => {
    setDrawing(false)
  }

  const handleProductSelection = (product: string) => {
    setProduct(product)
  }

  const handleImageGeneration = () => {
    setLoading(true)
    // Simulate image generation
    setTimeout(() => {
      const generatedImage = 'https://via.placeholder.com/300?text=Generated+Image'
      setGeneratedImages([...generatedImages, generatedImage])
      setLoading(false)
    }, 2000)
  }

  const handleBrushSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrushSize(Number(event.target.value))
  }

  const openModal = (imageUrl: string) => {
    // Implement modal logic here
    console.log('Opening modal with image:', imageUrl)
  }

  useEffect(() => {
    if (canvasRef.current && imageDimensions.width > 0 && imageDimensions.height > 0) {
      canvasRef.current.width = imageDimensions.width
      canvasRef.current.height = imageDimensions.height
    }
  }, [imageDimensions])

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <header className="bg-blue-800 text-white p-4 mb-4 flex justify-between">
        <img src="https://www.tdnm.cloud/logo.png" alt="Logo" className="w-12 h-12" />
        <nav className="flex space-x-4">
          <a href="#" className="text-white hover:text-gray-300">Trang chủ</a>
          <a href="#" className="text-white hover:text-gray-300">Sản phẩm</a>
          <a href="#" className="text-white hover:text-gray-300">Liên hệ</a>
        </nav>
      </header>
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Image Generation App</h1>
      <div className="mb-4">
        <Label htmlFor="image-upload" className="text-blue-800">Upload Image</Label>
        <Input type="file" id="image-upload" onChange={handleImageUpload} className="w-full p-2 border border-blue-800 rounded" />
      </div>
      {image && (
        <div className="mb-4 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="absolute top-0 left-0 border-2 border-gray-300 shadow-md rounded-lg"
            style={{ width: `${imageDimensions.width}px`, height: `${imageDimensions.height}px` }}
          />
          <img
            ref={imageRef}
            src={URL.createObjectURL(image)}
            alt="Uploaded Image"
            className="w-full h-full object-contain border-2 border-gray-300 shadow-md rounded-lg"
            style={{ width: `${imageDimensions.width}px`, height: `${imageDimensions.height}px` }}
          />
          <div className="flex justify-between mb-4">
            <Label htmlFor="brush-size" className="text-blue-800">Brush Size:</Label>
            <Input
              type="range"
              id="brush-size"
              min="1"
              max="50"
              value={brushSize}
              onChange={handleBrushSizeChange}
              className="w-full p-2 border border-blue-800 rounded"
            />
            <span className="text-blue-800">{brushSize}</span>
          </div>
          <div className="product-selection-container mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(products).map((product) => (
              <Button key={product} onClick={() => handleProductSelection(product)} className="w-full p-2 bg-blue-800 text-white hover:bg-blue-700 rounded shadow-md">
                {product}
              </Button>
            ))}
          </div>
          <Button onClick={handleImageGeneration} className="w-full p-2 bg-blue-800 text-white hover:bg-blue-700 rounded mt-4 shadow-md">Generate Image</Button>
        </div>
      )}
      {loading ? (
        <div className="loading-container">
          <p className="loading-text estimated-time text-blue-800">Thời gian chờ dự kiến: 1-2 phút</p>
        </div>
      ) : generatedImages.length > 0 ? (
        <div className="generated-images-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {generatedImages.map((imageUrl, index) => (
            <div 
              key={index} 
              className="generated-image-wrapper relative border-2 border-gray-300 shadow-md rounded-lg p-2"
              onClick={() => openModal(imageUrl)}
            >
              <img src={imageUrl} alt={`Generated ${index + 1}`} className="generated-image w-full h-full object-contain rounded-lg" />
              <a 
                href={imageUrl} 
                download={`generated_image_${index + 1}.png`} 
                className="download-button absolute bottom-2 right-2 bg-white text-blue-800 hover:text-gray-300 px-2 py-1 rounded shadow-md"
                onClick={e => e.stopPropagation()}
              >
                Tải ảnh {index + 1} về máy
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="output-placeholder text-blue-800">Ảnh kết quả sẽ hiển thị ở đây</div>
      )}
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import UsageGuide from './components/UsageGuide';

// Định nghĩa kiểu dữ liệu
type TabType = 'img2img';

// Cấu hình API TensorArt
const TENSOR_ART_API_URL = "https://ap-east-1.tensorart.cloud/v1";
const WORKFLOW_TEMPLATE_ID = "837405094118019506";

const PRODUCTS = [
  "C1012 Glacier White", "C1026 Polar", "C3269 Ash Grey", "C3168 Silver Wave", "C1005 Milky White",
  "C2103 Onyx Carrara", "C2104 Massa", "C3105 Casla Cloudy", "C3146 Casla Nova", "C2240 Marquin",
  "C2262 Concrete (Honed)", "C3311 Calacatta Sky", "C3346 Massimo", "C4143 Mario", "C4145 Marina",
  "C4202 Calacatta Gold", "C1205 Casla Everest", "C4211 Calacatta Supreme", "C4204 Calacatta Classic",
  "C1102 Super White", "C4246 Casla Mystery", "C4345 Oro", "C4346 Luxe", "C4342 Casla Eternal",
  "C4221 Athena", "C4255 Calacatta Extra"
];

const PRODUCT_IMAGE_MAP: { [key: string]: string } = {
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

const App: React.FC = () => {
  const [productCode, setProductCode] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string>('');
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(10);
  const [brushColor, setBrushColor] = useState<string>('rgba(255, 0, 0, 0.5)');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const quotes = [
    "Đá thạch anh mang lại sự sang trọng và bền bỉ cho mọi không gian.",
    "Thiết kế đẹp bắt đầu từ những chi tiết nhỏ nhất.",
    "CaslaQuartz - Sự lựa chọn hoàn hảo cho ngôi nhà hiện đại.",
    "Mỗi viên đá là một câu chuyện về nghệ thuật và công nghệ.",
    "Mẹo: Phối màu sáng với CaslaQuartz để làm nổi không gian.",
    "Mẹo: Kết hợp nhiều mẫu đá để tạo điểm nhấn.",
  ];

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY || ''}`,
  };

  // Khởi tạo canvas và vẽ ảnh khi upload
  useEffect(() => {
    if (uploadedImage && canvasRef.current && maskCanvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const img = imageRef.current;
      img.src = uploadedImage;

      img.onload = () => {
        const maxWidth = 500;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
      };

      img.onerror = () => {
        setError('Không thể tải ảnh. Vui lòng chọn ảnh khác.');
      };
    }
  }, [uploadedImage]);

  // Xử lý vẽ mask
  const handleMaskMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawMask(event);
  };

  const handleMaskMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) drawMask(event);
  };

  const handleMaskMouseUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleMaskMouseLeave = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const drawMask = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return;

    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const canvasRect = maskCanvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    maskCtx.fillStyle = brushColor;
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
    maskCtx.fill();

    applyMask();
  };

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!maskCtx) return;

    maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    applyMask();
  };

  const applyMask = () => {
    if (!canvasRef.current || !maskCanvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');

    if (!ctx || !maskCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const compositeCtx = compositeCanvas.getContext('2d');

    if (!compositeCtx) return;

    compositeCtx.drawImage(imageRef.current, 0, 0, width, height);
    compositeCtx.globalCompositeOperation = 'source-in';
    compositeCtx.drawImage(maskCanvas, 0, 0);

    setMaskedImageUrl(compositeCanvas.toDataURL());
  };

  const validateProductCode = (code: string): boolean => PRODUCTS.includes(code);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setMaskedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setMaskedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const uploadImageToTensorArt = async (imageData: string): Promise<string> => {
    const url = `${TENSOR_ART_API_URL}/resource/image`;
    const payload = { expireSec: 7200 };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const resourceResponse = await response.json();
      const putUrl = resourceResponse.putUrl;
      const resourceId = resourceResponse.resourceId;
      if (!putUrl || !resourceId) throw new Error('Invalid API response');
      const imageBlob = await (await fetch(imageData)).blob();
      const putResponse = await fetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: imageBlob,
      });
      if (![200, 203].includes(putResponse.status)) throw new Error(`PUT failed: ${putResponse.status}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return resourceId;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const pollJobStatus = async (jobId: string): Promise<string> => {
    const maxAttempts = 36;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await axios.get(`${TENSOR_ART_API_URL}/jobs/${jobId}`, { headers });
      const { status, successInfo, failedInfo } = response.data.job;
      if (status === 'SUCCESS') return successInfo.images[0].url;
      if (status === 'FAILED' || status === 'ERROR') throw new Error(failedInfo?.reason || 'Job failed');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error('Job timed out after 3 minutes');
  };

  const processImg2Img = async () => {
    if (!uploadedImage || !maskedImageUrl || !productCode) {
      setError('Vui lòng tải ảnh, vẽ mask và chọn mã sản phẩm.');
      return;
    }
    if (!validateProductCode(productCode)) {
      setError('Mã sản phẩm không hợp lệ.');
      return;
    }

    setLoading(true);
    setGeneratedImages([]);
    setProgress(0);
    setCurrentQuote(0);
    setError(null);

    try {
      const imageResourceId = await uploadImageToTensorArt(maskedImageUrl);
      const productImageResourceId = await uploadImageToTensorArt(PRODUCT_IMAGE_MAP[productCode]);

      const workflowData = {
        request_id: Date.now().toString(),
        templateId: WORKFLOW_TEMPLATE_ID,
        fields: {
          fieldAttrs: [
            { nodeId: "731", fieldName: "image", fieldValue: imageResourceId },
            { nodeId: "735", fieldName: "image", fieldValue: productImageResourceId },
          ],
        },
      };

      const response = await axios.post(`${TENSOR_ART_API_URL}/jobs/workflow/template`, workflowData, { headers });
      const jobId = response.data.job.id;
      const imageUrl = await pollJobStatus(jobId);
      setGeneratedImages([imageUrl]);
      toast.success('Tạo ảnh thành công!');
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response
        ? `Lỗi từ server: ${err.response.data.message || err.message}`
        : `Có lỗi xảy ra: ${(err as Error).message}`;
      setError(errorMessage);
      toast.error('Có lỗi khi tạo ảnh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 100));
        setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const openModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
  };

  return (
    <div className="app-container min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
      <div className="overlay bg-black/40 backdrop-blur-sm min-h-screen w-full flex items-center justify-center">
        <div className="content bg-white/90 rounded-2xl shadow-2xl p-8 max-w-5xl w-full mx-4">
          <header className="header bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-t-2xl text-white flex items-center justify-center gap-4">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Casla Quartz Logo" className="h-16 transition-transform duration-300 hover:scale-110" />
            <h1 className="text-3xl font-bold">Đưa Kiệt Tác Vào Công Trình Của Bạn!</h1>
          </header>
          <div className="tab-container py-6">
            <UsageGuide />
          </div>
          <div className="grid-container grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="input-area space-y-6">
              <div className="canvas-container bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 overflow-hidden">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Image Masking Studio</h2>
                <div className="tool-bar flex flex-wrap items-center justify-between gap-4 mb-6">
                  <label htmlFor="image-upload" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl shadow-md hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 cursor-pointer">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={clearMask}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-md hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                  >
                    Clear Mask
                  </button>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg cursor-pointer accent-indigo-600 transition-all duration-300"
                    />
                    <span className="text-sm text-gray-600 font-medium">Size: {brushSize}</span>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
                    />
                  </div>
                </div>
                {uploadedImage ? (
                  <div className="relative canvas-wrapper group">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto rounded-xl border-2 border-gray-100 shadow-inner"
                    />
                    <canvas
                      ref={maskCanvasRef}
                      className="absolute top-0 left-0 w-full h-auto rounded-xl pointer-events-auto transition-opacity duration-300 group-hover:opacity-70"
                      style={{ opacity: 0.5 }}
                      onMouseDown={handleMaskMouseDown}
                      onMouseMove={handleMaskMouseMove}
                      onMouseUp={handleMaskMouseUp}
                      onMouseLeave={handleMaskMouseLeave}
                    />
                    <img ref={imageRef} src={uploadedImage} alt="Uploaded" className="hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Vẽ để tạo mask...</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-gray-600 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-12 h-12 text-indigo-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.125-8.419m11.25 8.419a4.5 4.5 0 00-1.124-8.419"
                      />
                    </svg>
                    <span className="text-lg font-medium mt-2">Kéo thả hoặc nhấn để tải ảnh</span>
                    <span className="text-sm opacity-70">(.jpg, .png)</span>
                  </div>
                )}
              </div>
              <div className="product-selection space-y-2">
                <label htmlFor="productCode" className="text-sm font-medium text-gray-700">Mã sản phẩm:</label>
                <input
                  type="text"
                  id="productCode"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Nhập mã sản phẩm..."
                  list="productList"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
                />
                <datalist id="productList">
                  {PRODUCTS.map((product, index) => (
                    <option key={index} value={product} />
                  ))}
                </datalist>
                {productCode && PRODUCT_IMAGE_MAP[productCode] && (
                  <div className="product-preview mt-2">
                    <img
                      src={PRODUCT_IMAGE_MAP[productCode]}
                      alt="Product Preview"
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                  </div>
                )}
              </div>
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl shadow-md hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={processImg2Img}
                disabled={loading || !uploadedImage || !maskedImageUrl || !productCode}
              >
                {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
              </button>
            </div>
            <div className="output-area flex flex-col items-center justify-center space-y-6">
              {error ? (
                <div className="error-message bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md text-center w-full max-w-md">
                  <strong>Lỗi!</strong> {error}
                </div>
              ) : loading ? (
                <div className="loading-container bg-white/80 rounded-xl p-6 shadow-lg w-full max-w-md">
                  <div className="spinner flex justify-center">
                    <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="progress-bar w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="loading-text text-gray-600 text-center mt-3 font-medium animate-fade-in">{quotes[currentQuote]}</p>
                  <p className="loading-text text-gray-500 text-sm text-center">Thời gian chờ: ~1-2 phút</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="generated-images-container grid grid-cols-1 gap-6 w-full">
                  {generatedImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="generated-image-wrapper relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => openModal(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-auto rounded-xl object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                      <a
                        href={imageUrl}
                        download={`generated_image_${index + 1}.png`}
                        className="absolute bottom-2 right-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                        onClick={e => e.stopPropagation()}
                      >
                        Tải ảnh {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              ) : maskedImageUrl ? (
                <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-gray-800">Kết quả Mask</h3>
                  <div className="relative w-full">
                    <img
                      src={maskedImageUrl}
                      alt="Masked"
                      className="w-full h-auto rounded-xl border-2 border-gradient-to-br from-indigo-100 to-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-900/10 rounded-xl opacity-0 hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Nhấp để xem chi tiết</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="output-placeholder bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-indigo-200 rounded-xl p-8 text-gray-500 text-center w-full max-w-md hover:border-indigo-400 transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-12 h-12 text-indigo-500 mx-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.125-8.419m11.25 8.419a4.5 4.5 0 00-1.124-8.419"
                    />
                  </svg>
                  <span className="text-lg font-medium mt-2 block">Ảnh sẽ hiển thị ở đây</span>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
      {isModalOpen && (
        <div className="image-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeModal}>
          <span className="close-modal absolute top-6 right-6 text-white text-3xl cursor-pointer bg-gray-800/50 rounded-full p-2 hover:bg-gray-700 transition-all duration-300" onClick={closeModal}>
            &times;
          </span>
          <img src={modalImage} alt="Full size" className="max-w-4xl max-h-[90vh] rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import fabric from 'fabric';
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

export default function CaslaQuartzImageGenerator() {
  const [productCode, setProductCode] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(10);
  const [brushColor, setBrushColor] = useState<string>('rgba(255, 0, 0, 0.5)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY}`,
  };

  const validateProductCode = (code: string) => {
    return PRODUCTS.includes(code);
  };

  // Khởi tạo canvas khi ảnh được tải lên
  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        freeDrawingBrush: {
          width: brushSize,
          color: brushColor,
        },
      });

      fabric.Image.fromURL(uploadedImage, (img: fabric.Image) => {
        newCanvas.setWidth(img.width!);
        newCanvas.setHeight(img.height!);
        newCanvas.add(img);
      });

      setCanvas(newCanvas);
    }
  }, [uploadedImage, brushSize, brushColor]);

  // Tự động lưu mask khi người dùng vẽ
  useEffect(() => {
    if (canvas) {
      const handleMouseUp = () => {
        const maskData = canvas.toDataURL({
          format: 'png',
          quality: 1,
        });
        setMaskImage(maskData);
      };

      canvas.on('mouse:up', handleMouseUp);
      return () => {
        canvas.off('mouse:up', handleMouseUp);
      };
    }
  }, [canvas]);

  // Mở modal hiển thị ảnh lớn
  const openModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
  };

  const uploadImageToTensorArt = async (imageData: string): Promise<string> => {
    const url = `${TENSOR_ART_API_URL}/resource/image`;
    const payload = { expireSec: 7200 };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`POST failed: ${response.status} - ${responseText}`);
      }
      const resourceResponse = JSON.parse(responseText);
      const putUrl = resourceResponse.putUrl as string;
      const resourceId = resourceResponse.resourceId as string;
      const putHeaders = (resourceResponse.headers as Record<string, string>) || { 'Content-Type': 'image/jpeg' };
      if (!putUrl || !resourceId) {
        throw new Error(`Invalid response: ${JSON.stringify(resourceResponse)}`);
      }
      const imageBlob = await (await fetch(imageData)).blob();
      const putResponse = await fetch(putUrl, {
        method: 'PUT',
        headers: putHeaders,
        body: imageBlob,
      });
      if (![200, 203].includes(putResponse.status)) {
        throw new Error(`PUT failed: ${putResponse.status} - ${await putResponse.text()}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
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
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw new Error('Job timed out after 3 minutes');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const processImg2Img = async () => {
  if (!uploadedImage || !maskImage || !productCode) {
    setError('Vui lòng tải ảnh, vẽ mask và nhập mã sản phẩm.');
    return;
  }
  if (!validateProductCode(productCode)) {
    setError('Mã sản phẩm không hợp lệ. Vui lòng chọn từ danh sách sản phẩm.');
    return;
  }
  setGeneratedImages([]);
  setProgress(0);
  setCurrentQuote(0);
  setLoading(true);
  setError(null);

  try {
    // Upload ảnh input từ người dùng (ảnh đã được tạo mask)
    const imageResourceId = await uploadImageToTensorArt(uploadedImage);
    // Upload ảnh sản phẩm
    const productImageUrl = PRODUCT_IMAGE_MAP[productCode];
    const productImageResourceId = await uploadImageToTensorArt(productImageUrl);

    // Chuẩn bị dữ liệu cho workflow template
    const workflowData = {
      request_id: Date.now().toString(),
      templateId: WORKFLOW_TEMPLATE_ID,
      fields: {
        fieldAttrs: [
          {
            nodeId: "731", // Node cho ảnh đã được tạo mask
            fieldName: "image",
            fieldValue: imageResourceId,
          },
          {
            nodeId: "735", // Node cho ảnh sản phẩm
            fieldName: "image",
            fieldValue: productImageResourceId,
          },
        ],
      },
    };

    // Gửi yêu cầu tạo job từ workflow template
    const response = await axios.post(
      `${TENSOR_ART_API_URL}/jobs/workflow/template`,
      workflowData,
      { headers }
    );
    const jobId = response.data.job.id;
    const imageUrl = await pollJobStatus(jobId);
    setGeneratedImages([imageUrl]);
    toast.success('Tạo ảnh thành công!');
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      setError(`Lỗi từ server: ${err.response.data.message || err.message}`);
    } else {
      setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
    }
    console.error(err);
    toast.error('Có lỗi xảy ra khi tạo ảnh');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 100));
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const selectedProductImage = PRODUCT_IMAGE_MAP[productCode] || '';

  // Thêm phần JSX cho hiển thị danh sách sản phẩm
  const productInputSection = (
    <div className="product-selection">
      <label htmlFor="productCode">Mã sản phẩm:</label>
      <input
        type="text"
        id="productCode"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        placeholder="Nhập mã sản phẩm..."
        list="productList"
      />
      <datalist id="productList">
        {PRODUCTS.map((product, index) => (
          <option key={index} value={product}>
            {product}
          </option>
        ))}
      </datalist>
      {productCode && PRODUCT_IMAGE_MAP[productCode] && (
        <div className="product-preview">
          <img 
            src={PRODUCT_IMAGE_MAP[productCode]} 
            alt="Product Preview" 
            className="product-image"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="overlay">
        <div className="content">
          <header className="header">
            <img src="logo.png" alt="Casla Quartz Logo" />
            <h1>Đưa Kiệt Tác Vào Công Trình Của Bạn!</h1>
          </header>
          <div className="tab-container">
            <UsageGuide />
          </div>
          <div className="grid-container">
            <div className="input-area">
              <div className="dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
                {uploadedImage ? (
                  <canvas ref={canvasRef} id="mask-canvas" />
                ) : (
                  <div onClick={() => document.getElementById('image-upload')?.click()}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 8v4m0 0l-4-4m4 4l4-4" />
                    </svg>
                    <p>Kéo thả hoặc nhấn để tải ảnh</p>
                    <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                )}
              </div>
              {productInputSection}
              <div className="brush-tools">
                <label>Kích thước brush:</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
                <label>Màu brush:</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                />
              </div>
              <button
                className="generate-button"
                onClick={processImg2Img}
                disabled={loading || !uploadedImage || !maskImage}
              >
                {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
              </button>
            </div>
            <div className="output-area">
              {(() => {
                if (error) {
                  return (
                    <div className="error-message">
                      <strong>Lỗi!</strong> <span>{error}</span>
                    </div>
                  );
                }
                if (loading) {
                  return (
                    <div className="loading-container">
                      <div className="spinner">
                        <div></div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="loading-text quote-text">{quotes[currentQuote]}</p>
                      <p className="loading-text estimated-time">Thời gian chờ dự kiến: 1-2 phút</p>
                    </div>
                  );
                }
                if (generatedImages.length > 0) {
                  return (
                    <div className="generated-images-container">
                      {generatedImages.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className="generated-image-wrapper"
                          onClick={() => openModal(imageUrl)}
                        >
                          <img src={imageUrl} alt={`Generated ${index + 1}`} className="generated-image" />
                          <a 
                            href={imageUrl} 
                            download={`generated_image_${index + 1}.png`} 
                            className="download-button"
                            onClick={e => e.stopPropagation()}
                          >
                            Tải ảnh {index + 1} về máy
                          </a>
                        </div>
                      ))}
                    </div>
                  );
                }
                return <div className="output-placeholder">Ảnh sẽ hiển thị ở đây sau khi tạo</div>;
              })()}
            </div>
          </div>
          <Footer />
        </div>
      </div>
      {isModalOpen && (
        <div className="image-modal" onClick={closeModal}>
          <span className="close-modal">&times;</span>
          <img src={modalImage} alt="Full size" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

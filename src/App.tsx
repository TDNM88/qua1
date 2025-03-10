import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from './components/Footer';
import UsageGuide from './components/UsageGuide';
import * as protobuf from 'protobufjs';
import './styles.css';

// Định nghĩa schema protobuf
const workflowSchema = `
  message WorkflowRequest {
    string request_id = 1;
    string templateId = 2;
    repeated Field fields = 3;
  }
  message Field {
    string nodeId = 1;
    string fieldName = 2;
    string fieldValue = 3;
  }
`;

const root = protobuf.parse(workflowSchema).root;
const WorkflowRequest = root.lookupType('WorkflowRequest');

// Cấu hình API TensorArt
const TENSOR_ART_API_URL = "https://ap-east-1.tensorart.cloud/v1";
const WORKFLOW_TEMPLATE_ID = "837405094118019506";

// Danh sách sản phẩm
const PRODUCTS: string[] = [
  "C1012 Glacier White", "C1026 Polar", "C3269 Ash Grey", "C3168 Silver Wave", "C1005 Milky White",
  "C2103 Onyx Carrara", "C2104 Massa", "C3105 Casla Cloudy", "C3146 Casla Nova", "C2240 Marquin",
  "C2262 Concrete (Honed)", "C3311 Calacatta Sky", "C3346 Massimo", "C4143 Mario", "C4145 Marina",
  "C4202 Calacatta Gold", "C1205 Casla Everest", "C4211 Calacatta Supreme", "C4204 Calacatta Classic",
  "C1102 Super White", "C4246 Casla Mystery", "C4345 Oro", "C4346 Luxe", "C4342 Casla Eternal",
  "C4221 Athena", "C4255 Calacatta Extra"
];

// Bản đồ ảnh sản phẩm
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

// Hàm tạo request_id ngẫu nhiên
const createMD5 = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function CaslaQuartzImageGenerator() {
  const [activeTab, setActiveTab] = useState<'img2img' | 'text2img'>('img2img');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('floor');
  const [isCustomPosition, setIsCustomPosition] = useState<boolean>(false);
  const [img2imgSize, setImg2ImgSize] = useState<string>('1024x1024');
  const [text2ImgSize, setText2ImgSize] = useState<string>('1024x1024');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [img2imgSelectedProducts, setImg2ImgSelectedProducts] = useState<string[]>([]);
  const [text2imgSelectedProducts, setText2ImgSelectedProducts] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<number>(0);

  const quotes: string[] = [
    "Đá thạch anh mang lại sự sang trọng và bền bỉ cho mọi không gian.",
    "Thiết kế đẹp bắt đầu từ những chi tiết nhỏ nhất.",
    "CaslaQuartz - Sự lựa chọn hoàn hảo cho ngôi nhà hiện đại.",
    "Mỗi viên đá là một câu chuyện về nghệ thuật và công nghệ.",
    "Mẹo: Phối màu sáng với CaslaQuartz để làm nổi không gian.",
    "Mẹo: Kết hợp nhiều mẫu đá để tạo điểm nhấn.",
  ];

  const headers = {
    'Content-Type': 'application/x-protobuf',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY}`,
  };

  const uploadImageToTensorArt = async (imageData: string): Promise<string> => {
    const url = `${TENSOR_ART_API_URL}/resource/image`;
    const payload = { expireSec: 7200 };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`POST failed: ${response.status} - ${responseText}`);
      }
      const resourceResponse = JSON.parse(responseText);
      const putUrl: string = resourceResponse.putUrl;
      const resourceId: string = resourceResponse.resourceId;
      const putHeaders: Record<string, string> = resourceResponse.headers || { 'Content-Type': 'image/jpeg' };
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

  const renderProducts = (
    selectedProducts: string[],
    setSelectedProducts: (products: string[]) => void
  ) => {
    return PRODUCTS.map((product) => (
      <button
        key={product}
        className={`product-button ${selectedProducts.includes(product) ? 'active' : ''}`}
        onClick={() => {
          if (activeTab === 'img2img') {
            if (selectedProducts.includes(product)) {
              setImg2ImgSelectedProducts(selectedProducts.filter((p) => p !== product));
            } else if (selectedProducts.length < 10) {
              setImg2ImgSelectedProducts([...selectedProducts, product]);
            }
          } else {
            setText2ImgSelectedProducts(
              selectedProducts.includes(product)
                ? selectedProducts.filter((p) => p !== product)
                : [...selectedProducts, product]
            );
          }
        }}
      >
        {product}
      </button>
    ));
  };

  const switchTab = (tab: 'img2img' | 'text2img') => {
    setActiveTab(tab);
    setGeneratedImages([]);
    setLoading(false);
    setError(null);
    setUploadedImage(null);
    setPrompt('');
    setImg2ImgSelectedProducts([]);
    setText2ImgSelectedProducts([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomPosition(true);
      setPosition('');
    } else {
      setIsCustomPosition(false);
      setPosition(value);
    }
  };

  const handleCustomPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      setPosition(value);
    }
  };

  const processImg2Img = async () => {
    if (!uploadedImage || img2imgSelectedProducts.length === 0 || !position) {
      setError('Vui lòng tải ảnh, chọn ít nhất một sản phẩm và chọn/nhập vị trí đặt đá.');
      return;
    }
    if (img2imgSelectedProducts.length > 10) {
      setError('Chỉ có thể chọn tối đa 10 sản phẩm.');
      return;
    }

    setGeneratedImages([]);
    setProgress(0);
    setCurrentQuote(0);
    setLoading(true);
    setError(null);

    try {
      const imageResourceId = await uploadImageToTensorArt(uploadedImage);

      const promises = img2imgSelectedProducts.map(async (product) => {
        const textureFilePath = PRODUCT_IMAGE_MAP[product];
        if (!textureFilePath) throw new Error(`Không tìm thấy ảnh sản phẩm cho ${product}`);

        const textureResourceId = await uploadImageToTensorArt(textureFilePath);

        const message = WorkflowRequest.create({
          request_id: createMD5(),
          templateId: WORKFLOW_TEMPLATE_ID,
          fields: [
            { nodeId: "731", fieldName: "image", fieldValue: imageResourceId },
            { nodeId: "734", fieldName: "text", fieldValue: position.toLowerCase() },
            { nodeId: "735", fieldName: "image", fieldValue: textureResourceId },
          ],
        });

        const buffer = WorkflowRequest.encode(message).finish();

        const response = await axios.post(
          `${TENSOR_ART_API_URL}/jobs/workflow/template`,
          buffer,
          { headers, responseType: 'json' }
        );
        const jobId = response.data.job.id;
        return pollJobStatus(jobId);
      });

      const imageUrls = await Promise.all(promises);
      setGeneratedImages(imageUrls);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Lỗi từ server: ${err.response.data.message || err.message}`);
      } else {
        setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processText2Img = async () => {
    if (!prompt || text2imgSelectedProducts.length === 0) {
      setError('Vui lòng nhập mô tả và chọn ít nhất một sản phẩm.');
      return;
    }

    setGeneratedImages([]);
    setProgress(0);
    setCurrentQuote(0);
    setLoading(true);
    setError(null);

    try {
      const [width, height] = text2ImgSize.split('x').map(Number);
      const fullPrompt = `${prompt}, featuring ${text2imgSelectedProducts.join(', ')} quartz marble`;
      const txt2imgData = {
        request_id: createMD5(),
        stages: [
          { type: 'INPUT_INITIALIZE', inputInitialize: { seed: -1, count: 1 } },
          {
            type: 'DIFFUSION',
            diffusion: {
              width,
              height,
              prompts: [{ text: fullPrompt }],
              negativePrompts: [{ text: ' ' }],
              sdModel: '779398605850080514',
              sdVae: 'ae.sft',
              sampler: 'Euler a',
              steps: 30,
              cfgScale: 8,
              clipSkip: 1,
              etaNoiseSeedDelta: 31337,
            },
          },
        ],
      };
      const response = await axios.post(`${TENSOR_ART_API_URL}/jobs`, txt2imgData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY}`,
        },
      });
      const jobId = response.data.job.id;
      const imageUrl = await pollJobStatus(jobId);
      setGeneratedImages([imageUrl]);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Lỗi từ server: ${err.response.data.message || err.message}`);
      } else {
        setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
      }
      console.error(err);
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

  return (
    <div className="app-container">
      <div className="overlay">
        <div className="content">
          <header className="header">
            <img src="logo.png" alt="Casla Quartz Logo" />
            <h1>Đưa Kiệt Tác Vào Công Trình Của Bạn!</h1>
          </header>
          <div className="tab-container">
            <UsageGuide />
            <div className="tab-buttons">
              <button
                className={`tab-button ${activeTab === 'img2img' ? 'active' : ''}`}
                onClick={() => switchTab('img2img')}
              >
                Tạo Ảnh CaslaQuartz Cùng Công Trình Có Sẵn
              </button>
              <button
                className={`tab-button ${activeTab === 'text2img' ? 'active' : ''}`}
                onClick={() => switchTab('text2img')}
              >
                Tạo Ảnh CaslaQuartz Từ Mô Tả Của Bạn
              </button>
            </div>
          </div>
          <div className="grid-container">
            <div className="input-area">
              {activeTab === 'img2img' && (
                <>
                  <div className="dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                    ) : (
                      <div onClick={() => document.getElementById('image-upload')?.click()}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 8v4m0 0l-4-4m4 4l4-4"
                          />
                        </svg>
                        <p>Kéo thả hoặc nhấn để tải ảnh</p>
                        <input
                          type="file"
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="position">Vị trí đặt đá:</label>
                    <select
                      id="position"
                      value={isCustomPosition ? 'custom' : position}
                      onChange={handlePositionChange}
                    >
                      <option value="floor">Sàn nhà</option>
                      <option value="wall">Tường</option>
                      <option value="countertop">Mặt bàn</option>
                      <option value="stair">Cầu thang</option>
                      <option value="tabletop">Mặt bàn</option>
                      <option value="backplash">Tường bếp</option>
                      <option value="counter">Quầy bar</option>
                      <option value="coffeetable">Bàn cafe</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                    {isCustomPosition && (
                      <input
                        type="text"
                        value={position}
                        onChange={handleCustomPositionChange}
                        placeholder="Nhập vị trí tùy chỉnh..."
                        maxLength={30}
                        className="custom-position-input"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="size-img2img">Kích thước:</label>
                    <select
                      id="size-img2img"
                      value={img2imgSize}
                      onChange={(e) => setImg2ImgSize(e.target.value)}
                    >
                      <option value="1152x768">1152x768</option>
                      <option value="1024x1024">1024x1024</option>
                      <option value="768x1152">768x1152</option>
                    </select>
                  </div>
                  <div>
                    <label>Chọn tối đa 10 sản phẩm:</label>
                    <div className="product-grid">
                      {renderProducts(img2imgSelectedProducts, setImg2ImgSelectedProducts)}
                    </div>
                  </div>
                  <button
                    className="generate-button"
                    onClick={processImg2Img}
                    disabled={loading || !uploadedImage || img2imgSelectedProducts.length === 0}
                  >
                    {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
                  </button>
                </>
              )}
              {activeTab === 'text2img' && (
                <>
                  <div>
                    <label htmlFor="prompt">Mô tả của bạn:</label>
                    <textarea
                      id="prompt"
                      placeholder="Nhập mô tả chi tiết..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="size-text2img">Kích thước:</label>
                    <select
                      id="size-text2img"
                      value={text2ImgSize}
                      onChange={(e) => setText2ImgSize(e.target.value)}
                    >
                      <option value="1024x1024">1024x1024</option>
                      <option value="768x512">768x512</option>
                      <option value="512x768">512x768</option>
                    </select>
                  </div>
                  <div>
                    <label>Chọn sản phẩm:</label>
                    <div className="product-grid">
                      {renderProducts(text2imgSelectedProducts, setText2ImgSelectedProducts)}
                    </div>
                  </div>
                  <button
                    className="generate-button"
                    onClick={processText2Img}
                    disabled={loading || !prompt || text2imgSelectedProducts.length === 0}
                  >
                    {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
                  </button>
                </>
              )}
            </div>
            <div className="output-area">
              {error ? (
                <div className="error-message">
                  <strong>Lỗi!</strong> <span>{error}</span>
                </div>
              ) : loading ? (
                <div className="loading-container">
                  <div className="spinner">
                    <div></div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="loading-text quote-text">{quotes[currentQuote]}</p>
                  <p className="loading-text estimated-time">Thời gian chờ dự kiến: 1-2 phút</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="generated-images">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="generated-image-container">
                      <img src={imageUrl} alt={`Generated ${index + 1}`} className="generated-image" />
                      <a
                        href={imageUrl}
                        download={`generated_image_${index + 1}.png`}
                        className="download-button"
                      >
                        Tải ảnh về máy
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="output-placeholder">Ảnh sẽ hiển thị ở đây sau khi tạo</div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fabric } from 'fabric';
import Footer from './components/Footer';
import UsageGuide from './components/UsageGuide';

// Định nghĩa kiểu dữ liệu
type TabType = 'img2img' | 'text2img';

// Cấu hình API TensorArt
const TENSOR_ART_API_URL = "https://ap-east-1.tensorart.cloud/v1";
const WORKFLOW_TEMPLATE_ID = "837405094118019506"; // Workflow template ID

// Hàm tạo request_id ngẫu nhiên
const createMD5 = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function CaslaQuartzImageGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('img2img');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('floor');
  const [isCustomPosition, setIsCustomPosition] = useState<boolean>(false);
  const [img2imgSize, setImg2ImgSize] = useState<string>('1024x1024');
  const [text2ImgSize, setText2ImgSize] = useState<string>('1024x1024');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);

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

  // Khởi tạo canvas khi ảnh được tải lên
  useEffect(() => {
    if (uploadedImage) {
      const newCanvas = new fabric.Canvas('mask-canvas', {
        isDrawingMode: true,
        freeDrawingBrush: {
          width: 10,
          color: 'rgba(255, 0, 0, 0.5)',
        },
      });

      fabric.Image.fromURL(uploadedImage, (img) => {
        newCanvas.setWidth(img.width!);
        newCanvas.setHeight(img.height!);
        newCanvas.add(img);
      });

      setCanvas(newCanvas);
    }
  }, [uploadedImage]);

  // Lưu mask khi người dùng hoàn thành vẽ
  const saveMask = () => {
    if (canvas) {
      const maskData = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      setMaskImage(maskData);
      toast.success('Mask đã được lưu!');
    }
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

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setGeneratedImages([]);
    setLoading(false);
    setError(null);
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
    if (value.length <= 15) {
      setPosition(value);
    }
  };

  const processImg2Img = async () => {
    if (!uploadedImage || !maskImage || !position) {
      setError('Vui lòng tải ảnh, vẽ mask và chọn/nhập vị trí đặt đá.');
      return;
    }
    setGeneratedImages([]);
    setProgress(0);
    setCurrentQuote(0);
    setLoading(true);
    setError(null);

    try {
      // Upload ảnh input từ người dùng
      const imageResourceId = await uploadImageToTensorArt(uploadedImage);
      // Upload mask
      const maskResourceId = await uploadImageToTensorArt(maskImage);

      // Chuẩn bị dữ liệu cho workflow template
      const workflowData = {
        request_id: createMD5(),
        templateId: WORKFLOW_TEMPLATE_ID,
        fields: {
          fieldAttrs: [
            {
              nodeId: "731", // Node cho ảnh input
              fieldName: "image",
              fieldValue: imageResourceId,
            },
            {
              nodeId: "734", // Node cho text (vị trí)
              fieldName: "Text",
              fieldValue: position.toLowerCase(),
            },
            {
              nodeId: "735", // Node cho mask
              fieldName: "image",
              fieldValue: maskResourceId,
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

  const processText2Img = async () => {
    if (!prompt) {
      setError('Vui lòng nhập mô tả.');
      return;
    }
    setGeneratedImages([]);
    setProgress(0);
    setCurrentQuote(0);
    setLoading(true);
    setError(null);
    try {
      const [width, height] = text2ImgSize.split('x').map(Number);
      const fullPrompt = `${prompt}, featuring quartz marble`;
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
      const response = await axios.post(`${TENSOR_ART_API_URL}/jobs`, txt2imgData, { headers });
      const jobId = response.data.job.id;
      const imageUrl = await pollJobStatus(jobId);
      setGeneratedImages([imageUrl]); // Chỉ tạo một ảnh cho text2img
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
                      <canvas id="mask-canvas" />
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
                  <button
                    className="generate-button"
                    onClick={saveMask}
                    disabled={!uploadedImage}
                  >
                    Lưu Mask
                  </button>
                  <button
                    className="generate-button"
                    onClick={processImg2Img}
                    disabled={loading || !uploadedImage || !maskImage}
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
                    <select id="size-text2img" value={text2ImgSize} onChange={(e) => setText2ImgSize(e.target.value)}>
                      <option value="1024x1024">1024x1024</option>
                      <option value="768x512">768x512</option>
                      <option value="512x768">512x768</option>
                    </select>
                  </div>
                  <button
                    className="generate-button"
                    onClick={processText2Img}
                    disabled={loading || !prompt}
                  >
                    {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
                  </button>
                </>
              )}
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

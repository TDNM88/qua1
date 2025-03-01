import React, { useState } from 'react';
import axios from 'axios';
import tams from 'tams-sdk';

// Define types
type TabType = 'img2img' | 'text2img';
type Product = string;

const TENSOR_ART_API_URL = "https://ap-east-1.tensorart.cloud/v1";

// Danh sách sản phẩm (từ Python)
const PRODUCTS = [
  "C1012 Glacier White", "C1026 Polar", "C3269 Ash Grey", "C3168 Silver Wave", "C1005 Milky White",
  "C2103 Onyx Carrara", "C2104 Massa", "C3105 Casla Cloudy", "C3146 Casla Nova", "C2240 Marquin",
  "C2262 Concrete (Honed)", "C3311 Calacatta Sky", "C3346 Massimo", "C4143 Mario", "C4145 Marina",
  "C4202 Calacatta Gold", "C1205 Casla Everest", "C4211 Calacatta Supreme", "C4204 Calacatta Classic",
  "C1102 Super White", "C4246 Casla Mystery", "C4345 Oro", "C4346 Luxe", "C4342 Casla Eternal",
  "C4221 Athena", "C4255 Calacatta Extra"
];

// Bản đồ ảnh sản phẩm (giả định nằm trong public/product_images)
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
  const [activeTab, setActiveTab] = useState<TabType>('img2img');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('floor');
  const [img2imgSize, setImg2ImgSize] = useState<string>('1024x1024');
  const [text2ImgSize, setText2ImgSize] = useState<string>('1024x1024');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [img2imgSelectedProducts, setImg2ImgSelectedProducts] = useState<Product[]>([]);
  const [text2imgSelectedProducts, setText2ImgSelectedProducts] = useState<Product[]>([]);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.REACT_APP_TENSOR_ART_API_KEY}`,
  };

  const uploadImageToTensorArt = async (imageData: string): Promise<string> => {
    const url = `${TENSOR_ART_API_URL}/resource/image`;
    const payload = JSON.stringify({ expireSec: 7200 });
  
    const apiKey = process.env.REACT_APP_TENSOR_ART_API_KEY;
    if (!apiKey) {
      throw new Error('Missing API Key in .env');
    }
  
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  
    try {
      console.log('API Key:', apiKey);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Payload:', payload);
  
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
      });
  
      const responseText = await response.text();
      console.log('Response:', response.status, responseText);
  
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
  
      console.log('Put URL:', putUrl);
      const imageBlob = await (await fetch(imageData)).blob();
      console.log('Image Blob:', { size: imageBlob.size, type: imageBlob.type });
  
      const putResponse = await fetch(putUrl, {
        method: 'PUT',
        headers: putHeaders,
        body: imageBlob,
      });
  
      const putResponseText = await putResponse.text();
      console.log('PUT Response:', putResponse.status, putResponseText);
  
      if (![200, 203].includes(putResponse.status)) {
        throw new Error(`PUT failed: ${putResponse.status} - ${putResponseText}`);
      }
  
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log('Upload successful - resourceId:', resourceId);
      return resourceId;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };
  // Hàm kiểm tra trạng thái job
  const pollJobStatus = async (jobId: string): Promise<string> => {
    const maxAttempts = 36; // 3 phút với 5s mỗi lần kiểm tra
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await axios.get(`${TENSOR_ART_API_URL}/jobs/${jobId}`, { headers });
      const { status, successInfo, failedInfo } = response.data.job;

      if (status === 'SUCCESS') return successInfo.images[0].url;
      if (status === 'FAILED' || status === 'ERROR') throw new Error(failedInfo?.reason || 'Job failed');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw new Error('Job timed out after 3 minutes');
  };

  // Hàm render danh sách sản phẩm
  const renderProducts = (selectedProducts: Product[], setSelectedProducts: (products: Product[]) => void) => {
    return PRODUCTS.map((product) => (
      <button
        key={product}
        type="button"
        className={`px-3 py-2 border border-gray-300 rounded-md cursor-pointer text-center transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
          selectedProducts.includes(product) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => {
          setSelectedProducts(
            selectedProducts.includes(product)
              ? selectedProducts.filter((p) => p !== product)
              : [...selectedProducts, product]
          );
        }}
      >
        {product}
      </button>
    ));
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setGeneratedImage(null);
    setLoading(false);
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Xử lý Img2Img
  const processImg2Img = async () => {
    if (!uploadedImage || img2imgSelectedProducts.length === 0) {
      setError('Vui lòng tải ảnh và chọn ít nhất một sản phẩm.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageResourceId = await uploadImageToTensorArt(uploadedImage);
      const selectedProduct = img2imgSelectedProducts[0];
      const textureFilePath = PRODUCT_IMAGE_MAP[selectedProduct];
      if (!textureFilePath) throw new Error(`Không tìm thấy ảnh sản phẩm cho ${selectedProduct}`);
      const textureResourceId = await uploadImageToTensorArt(textureFilePath);

      const [width, height] = img2imgSize.split('x').map(Number);
      const workflowParams = {
        '1': {
          classType: 'LayerMask: SegmentAnythingUltra V3',
          inputs: {
            black_point: 0.3,
            detail_dilate: 6,
            detail_erode: 65,
            detail_method: 'GuidedFilter',
            device: 'cuda',
            image: ['2', 0],
            max_megapixels: 2,
            process_detail: true,
            prompt: ['4', 0],
            sam_models: ['3', 0],
            threshold: 0.3,
            white_point: 0.99,
          },
          properties: { 'Node name for S&R': 'LayerMask: SegmentAnythingUltra V3' },
        },
        '10': {
          classType: 'Image Seamless Texture',
          inputs: { blending: 0.37, images: ['17', 0], tiled: 'true', tiles: 2 },
          properties: { 'Node name for S&R': 'Image Seamless Texture' },
        },
        '13': {
          classType: 'Paste By Mask',
          inputs: { image_base: ['2', 0], image_to_paste: ['10', 0], mask: ['8', 0], resize_behavior: 'resize' },
          properties: { 'Node name for S&R': 'Paste By Mask' },
        },
        '17': {
          classType: 'TensorArt_LoadImage',
          inputs: { _height: 768, _width: 512, image: textureResourceId, upload: 'image' },
          properties: { 'Node name for S&R': 'TensorArt_LoadImage' },
        },
        '2': {
          classType: 'TensorArt_LoadImage',
          inputs: { _height: height, _width: width, image: imageResourceId, upload: 'image' },
          properties: { 'Node name for S&R': 'TensorArt_LoadImage' },
        },
        '3': {
          classType: 'LayerMask: LoadSegmentAnythingModels',
          inputs: { grounding_dino_model: 'GroundingDINO_SwinB (938MB)', sam_model: 'sam_vit_h (2.56GB)' },
          properties: { 'Node name for S&R': 'LayerMask: LoadSegmentAnythingModels' },
        },
        '4': {
          classType: 'TensorArt_PromptText',
          inputs: { Text: position.toLowerCase() },
          properties: { 'Node name for S&R': 'TensorArt_PromptText' },
        },
        '7': {
          classType: 'PreviewImage',
          inputs: { images: ['13', 0] },
          properties: { 'Node name for S&R': 'PreviewImage' },
        },
        '8': {
          classType: 'MaskToImage',
          inputs: { mask: ['1', 1] },
          properties: { 'Node name for S&R': 'MaskToImage' },
        },
      };

      const response = await axios.post(
        `${TENSOR_ART_API_URL}/jobs/workflow`,
        { requestId: `workflow_${Date.now()}`, params: workflowParams, runningNotifyUrl: '' },
        { headers }
      );
      const jobId = response.data.job.id;
      const imageUrl = await pollJobStatus(jobId);
      setGeneratedImage(imageUrl);
    } catch (err: unknown) {
      setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Text2Img
  const processText2Img = async () => {
    if (!prompt || text2imgSelectedProducts.length === 0) {
      setError('Vui lòng nhập mô tả và chọn ít nhất một sản phẩm.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [width, height] = text2ImgSize.split('x').map(Number);
      const fullPrompt = `${prompt}, featuring ${text2imgSelectedProducts.join(', ')} quartz marble`;

      const txt2imgData = {
        request_id: Date.now().toString(),
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
      setGeneratedImage(imageUrl);
    } catch (err: unknown) {
      setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Giao diện giữ nguyên như mã của bạn
  return (
  <div className="bg-gray-50 min-h-screen py-8">
    <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto p-6">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 rounded-t-xl text-white shadow-lg">
        <div className="flex items-center justify-center space-x-4">
          <img src="logo.png" alt="Casla Quartz Logo" className="h-16 transition-transform duration-300 hover:scale-105" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-center tracking-wide">
              Đưa Kiệt Tác Vào Công Trình Của Bạn!
            </h1>
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 px-4">
        <div className="bg-gray-100 rounded-lg p-4 text-gray-700 shadow-sm md:max-w-md">
          <p className="mb-2 text-sm">Ứng dụng Trí tuệ nhân tạo giúp bạn trải nghiệm các mẫu sản phẩm đá thạch anh nhân tạo cao cấp...</p>
          <p className="text-xs italic">Các hình ảnh được tạo ra bởi ứng dụng này đều thuộc bản quyền của CaslaQuartz...</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ${
              activeTab === 'img2img' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => switchTab('img2img')}
          >
            Tạo Ảnh CaslaQuartz Cùng Công Trình Có Sẵn
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ${
              activeTab === 'text2img' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => switchTab('text2img')}
          >
            Tạo Ảnh CaslaQuartz Từ Mô Tả Của Bạn
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Lỗi!</strong> <span>{error}</span>
        </div>
      )}

      <div className="mt-8 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          {activeTab === 'img2img' && (
            <div className="flex flex-col gap-6">
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="max-w-full rounded-md shadow-sm" />
                ) : (
                  <div className="text-center" onClick={() => document.getElementById('image-upload')?.click()}>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 8v4m0 0l-4-4m4 4l4-4" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Kéo thả hoặc nhấn để tải ảnh</p>
                    <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Vị trí đặt đá:</label>
                  <select
                    id="position"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="floor">Sàn nhà</option>
                    <option value="wall">Tường</option>
                    <option value="countertop">Mặt bàn</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="size-img2img" className="block text-sm font-medium text-gray-700 mb-1">Kích thước:</label>
                  <select
                    id="size-img2img"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={img2imgSize}
                    onChange={(e) => setImg2ImgSize(e.target.value)}
                  >
                    <option value="1152x768">1152x768</option>
                    <option value="1024x1024">1024x1024</option>
                    <option value="768x1152">768x1152</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {renderProducts(img2imgSelectedProducts, setImg2ImgSelectedProducts)}
                </div>
              </div>
              <button
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={processImg2Img}
                disabled={loading || !uploadedImage || img2imgSelectedProducts.length === 0}
              >
                {loading ? 'Đang xử lý...' : 'Tạo ảnh'}
              </button>
            </div>
          )}
          {/* Text2Img tương tự, chỉnh tương ứng */}
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center">
          {generatedImage ? (
            <div className="text-center">
              {loading ? (
                <div className="flex items-center justify-center flex-col gap-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  <span className="text-gray-600">Đang tạo ảnh...</span>
                </div>
              ) : (
                <>
                  <img src={generatedImage} alt="Generated" className="rounded-lg shadow-md max-w-full" />
                  <a
                    href={generatedImage}
                    download="generated_image.png"
                    className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Tải ảnh về máy
                  </a>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-dashed rounded-lg w-full h-full flex items-center justify-center text-gray-500 p-4">
              Ảnh sẽ hiển thị ở đây sau khi tạo
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

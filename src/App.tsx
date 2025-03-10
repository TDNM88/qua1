const processImg2Img = async () => {
  if (!uploadedImage || img2imgSelectedProducts.length === 0 || !position) {
    setError('Vui lòng tải ảnh, chọn một sản phẩm và chọn/nhập vị trí đặt đá.');
    return;
  }
  setGeneratedImage(null);
  setProgress(0);
  setCurrentQuote(0);
  setLoading(true);
  setError(null);
  try {
    // Upload ảnh input từ người dùng
    const imageResourceId = await uploadImageToTensorArt(uploadedImage);
    const selectedProduct = img2imgSelectedProducts[0];
    const textureFilePath = PRODUCT_IMAGE_MAP[selectedProduct];
    if (!textureFilePath) throw new Error(`Không tìm thấy ảnh sản phẩm cho ${selectedProduct}`);
    // Upload ảnh texture
    const textureResourceId = await uploadImageToTensorArt(textureFilePath);

    // Chuẩn bị dữ liệu cho workflow template
    const workflowData = {
      request_id: createMD5(),
      templateId: WORKFLOW_TEMPLATE_ID,
      fields: {
        fieldAttrs: [
          {
            nodeId: "731", // Node cho ảnh input
            fieldName: "image",
            fieldValue: imageResourceId, // Resource ID của ảnh input
          },
          {
            nodeId: "734", // Node cho text (vị trí)
            fieldName: "Text", // Lưu ý: "Text" với chữ T viết hoa
            fieldValue: position.toLowerCase(), // Vị trí đặt đá
          },
          {
            nodeId: "735", // Node cho ảnh texture
            fieldName: "image",
            fieldValue: textureResourceId, // Resource ID của ảnh texture
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
    setGeneratedImage(imageUrl);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const errorMessage = err.response.data.details?.[0]?.message || 'Unknown error';
      if (errorMessage.includes('credits not enough')) {
        setError('Không đủ tín dụng để thực hiện yêu cầu. Vui lòng nạp thêm tín dụng.');
      } else {
        setError(`Lỗi từ server: ${err.response.data.message || err.message}`);
      }
    } else {
      setError(`Có lỗi xảy ra khi tạo ảnh: ${(err as Error).message}`);
    }
    console.error(err);
  } finally {
    setLoading(false);
  }
};

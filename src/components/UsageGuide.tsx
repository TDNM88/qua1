// src/components/UsageGuide.tsx
import React, { useState } from 'react';

const UsageGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="guide-container">
      <h2 className="guide-title">CaslaQuartz AI là gì?</h2>
      <p className="guide-intro">
        Ứng dụng Trí tuệ nhân tạo giúp bạn trải nghiệm các mẫu sản phẩm đá thạch anh nhân tạo cao cấp và đa dạng của CaslaQuartz tại mọi không gian kiến trúc mà bạn muốn! Dưới đây là một vài mẹo nhỏ để bạn có trải nghiệm tuyệt vời nhất.
      </p>

      {/* Nút mở rộng/thu gọn đặt ngay dưới đoạn intro */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="guide-expand-btn"
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Thu gọn' : 'Hướng dẫn sử dụng'}
      </button>

      {/* Phần mở rộng khi nhấn "Hướng dẫn sử dụng" */}
      {isExpanded && (
        <div className="guide-expanded-content">
          <ul className="guide-tips">
            <li>
              <strong>Chọn ảnh chất lượng tốt:</strong> Hãy upload những bức ảnh rõ nét, ánh sáng tốt để chúng tôi có thể tạo ra kết quả đẹp nhất cho bạn.
            </li>
            <li>
              <strong>Tránh vật cản:</strong> Nếu có thể, chọn ảnh ít đồ vật cản trở (như đồ nội thất, người đứng trước khu vực cần chỉnh sửa) để kết quả chính xác hơn nhé!
            </li>
            <li>
              <strong>Mô tả chi tiết (nếu dùng Text2Img):</strong> Khi nhập mô tả, hãy thêm một chút chi tiết để chúng tôi hiểu rõ ý tưởng của bạn (ví dụ: “một căn bếp hiện đại với mặt bàn đá trắng sáng”).
            </li>
            <li>
              <strong>Thời gian chờ:</strong> Việc tạo ảnh có thể mất khoảng 1 phút, bạn hãy chờ một chút và thưởng thức kết quả nhé!
            </li>
          </ul>
          <p className="guide-footer">
            <strong>Lưu ý:</strong> Các hình ảnh được tạo ra bởi ứng dụng này đều thuộc bản quyền của CaslaQuartz, vui lòng không sao chép và sử dụng với mục đích thương mại.
          </p>
          <p className="guide-footer">
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email{' '}
            <a href="mailto:info@caslaquartz.com">info@caslaquartz.com</a>. Chúc bạn có những phút giây sáng tạo tuyệt vời cùng CaslaQuartz!
          </p>
        </div>
      )}
    </div>
  );
};

export default UsageGuide;
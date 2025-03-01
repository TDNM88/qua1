import React from 'react';

const UsageGuide: React.FC = () => {
  return (
    <div className="guide-container">
      <h2 className="guide-title">Hướng Dẫn Sử Dụng CaslaQuartz AI</h2>
      <p className="guide-intro">
        Chào bạn! Để có trải nghiệm tốt nhất với ứng dụng của chúng tôi, bạn có thể làm theo các hướng dẫn dưới đây. Đừng lo, mọi thứ rất đơn giản và thú vị!
      </p>
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
        Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email{' '}
        <a href="mailto:info@caslaquartz.com">info@caslaquartz.com</a>. Chúc bạn có những phút giây sáng tạo tuyệt vời cùng CaslaQuartz!
      </p>
    </div>
  );
};

export default UsageGuide;
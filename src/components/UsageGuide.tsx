import React, { useState } from 'react';

const UsageGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Hướng Dẫn Sử Dụng CaslaQuartz AI</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:underline"
        >
          {isExpanded ? 'Thu gọn' : 'Mở rộng'}
        </button>
      </div>
      {isExpanded && (
        <>
          <p className="text-gray-600 mt-4">
            Chào bạn! Để có trải nghiệm tốt nhất với ứng dụng của chúng tôi, bạn có thể làm theo các hướng dẫn dưới đây. Đừng lo, mọi thứ rất đơn giản và thú vị!
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
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
          <p className="text-gray-600 mt-4">
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email <a href="mailto:info@caslaquartz.com" className="text-blue-500 hover:underline">info@caslaquartz.com</a>. Chúc bạn có những phút giây sáng tạo tuyệt vời cùng CaslaQuartz!
          </p>
        </>
      )}
    </div>
  );
};

export default UsageGuide;
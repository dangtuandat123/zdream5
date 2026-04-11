export const TOOL_TIPS: Record<string, string[]> = {
    'style-transfer': [
        'Ảnh chân dung rõ nét cho kết quả tốt nhất khi chuyển sang anime hoặc sơn dầu.',
        'Ảnh phong cảnh đẹp hơn khi chuyển sang màu nước hoặc cyberpunk.',
        'Tránh ảnh quá tối hoặc quá sáng — AI cần nhận diện chi tiết để chuyển đổi.',
        'Thử nhiều phong cách khác nhau với cùng 1 ảnh để so sánh kết quả.',
    ],
    'image-variation': [
        'Cường độ thấp (0.1-0.3): Thay đổi nhẹ, giữ nguyên cấu trúc chính.',
        'Cường độ trung bình (0.4-0.6): Cân bằng giữa sáng tạo và bảo toàn.',
        'Cường độ cao (0.7-1.0): Thay đổi mạnh, tạo phiên bản mới hoàn toàn.',
        'Dùng ảnh có bố cục rõ ràng để AI dễ tạo biến thể hài hòa.',
    ],
    'ad-image': [
        'Mô tả sản phẩm càng chi tiết, ảnh quảng cáo càng chuyên nghiệp.',
        'Chọn aspect ratio phù hợp: 1:1 cho feed, 9:16 cho story, 16:9 cho banner.',
        'Ảnh sản phẩm trên nền trắng/đơn giản cho kết quả sạch nhất.',
        'Thêm phong cách mong muốn trong mô tả: sang trọng, trẻ trung, tối giản...',
    ],
    'consistent-character': [
        'Dùng 2-3 ảnh cùng nhân vật từ các góc khác nhau để AI hiểu rõ hơn.',
        'Ảnh tham chiếu nên rõ mặt, đủ ánh sáng và ít bị che khuất.',
        'Mô tả bối cảnh chi tiết: vị trí, hành động, trang phục, ánh sáng.',
        'Phù hợp cho tạo avatar, truyện tranh, hoặc nhân vật branding.',
    ],
    'upscale': [
        '2x phù hợp cho ảnh chất lượng trung bình, muốn cải thiện nhẹ.',
        '4x cho ảnh nhỏ cần phóng to nhiều (sẽ tốn thêm thời gian xử lý).',
        'AI bổ sung chi tiết thông minh — không chỉ đơn giản kéo giãn pixel.',
        'Kết quả tốt nhất với ảnh có nội dung rõ ràng, không quá mờ.',
    ],
    'remove-bg': [
        'Ảnh có chủ thể tách biệt rõ ràng với nền cho kết quả tốt nhất.',
        'Hoạt động tốt với chân dung, sản phẩm, động vật, đồ vật.',
        'Tóc và lông mịn có thể cần tinh chỉnh thêm.',
        'Ảnh xuất ra nền trong suốt (PNG), sẵn sàng ghép vào thiết kế.',
    ],
    'remove-object': [
        'Mô tả rõ vị trí và đặc điểm vật thể cần xóa.',
        'VD: "người đứng bên phải", "cái bảng hiệu góc trên trái".',
        'Vật thể nhỏ và đơn giản dễ xóa sạch hơn vật thể lớn phức tạp.',
        'AI sẽ tự lấp đầy vùng xóa với nội dung phù hợp xung quanh.',
    ],
    'inpainting': [
        'Mask trắng = vùng cần AI vẽ lại. Vùng đen = giữ nguyên.',
        'Có thể dùng Paint hoặc bất kỳ app chỉnh ảnh nào để tạo mask.',
        'Mô tả nội dung thay thế càng chi tiết, kết quả càng chính xác.',
        'Vùng mask nên rộng hơn vật thể một chút để AI blend mượt hơn.',
    ],
    'extend': [
        'Chọn 1-2 hướng mở rộng để AI tập trung tốt hơn.',
        'Mô tả nội dung mong muốn giúp AI sinh nội dung chính xác hơn.',
        'Phù hợp để chuyển ảnh dọc sang ngang hoặc mở rộng bầu trời.',
        'Ảnh có pattern lặp lại (bầu trời, biển, cỏ) mở rộng đẹp nhất.',
    ],
    'image-to-prompt': [
        'Tải lên bất kỳ ảnh nào — AI sẽ phân tích và viết prompt chi tiết.',
        'Prompt tạo ra có thể dùng trực tiếp trong Tạo ảnh để tái tạo.',
        'Hữu ích khi muốn tạo ảnh tương tự nhưng không biết viết prompt.',
        'Kết quả bằng tiếng Anh cho độ chính xác cao nhất với AI tạo ảnh.',
    ],
}

export const TOOL_TIPS: Record<string, string[]> = {
    'style-transfer': [
        'Ảnh chân dung rõ nét cho kết quả tốt nhất khi chuyển sang anime hoặc sơn dầu.',
        'Ảnh phong cảnh đẹp hơn khi chuyển sang màu nước hoặc cyberpunk.',
        'Tránh ảnh quá tối hoặc quá sáng — AI cần nhận diện chi tiết để chuyển đổi.',
        'Thử nhiều phong cách khác nhau với cùng 1 ảnh để so sánh kết quả.',
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
    'image-edit': [
        'Tô vùng cần chỉnh sửa trên ảnh — vùng tô rộng hơn vật thể một chút để AI blend mượt.',
        'Xóa vật thể: tô lên vật thể thừa, AI tự lấp đầy với nền phù hợp.',
        'Thay thế: tô vùng + mô tả chi tiết nội dung mới để AI vẽ chính xác.',
        'Vật thể nhỏ, đơn giản dễ xử lý hơn. Có thể mô tả bằng text nếu không muốn tô.',
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

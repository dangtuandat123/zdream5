import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
    {
        name: "Cơ bản",
        price: "Miễn phí",
        desc: "Khởi đầu hoàn hảo cho người mới bắt đầu khám phá trí tuệ nhân tạo.",
        features: [
            "Tạo 10 ảnh mỗi ngày",
            "Độ phân giải tiêu chuẩn",
            "Công cụ Text-to-Image",
            "Giấy phép phi thương mại"
        ],
        buttonText: "Bắt đầu miễn phí",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$19",
        duration: "/tháng",
        desc: "Dành cho nhà sáng tạo và chuyên gia cần sức mạnh tối đa.",
        features: [
            "Tạo ảnh không giới hạn",
            "Kết xuất độ phân giải siêu nét (4K)",
            "Chế độ Image-to-Image (Tải ảnh mẫu)",
            "Quyền thương mại hoàn toàn",
            "Truy cập máy chủ tốc độ cao"
        ],
        buttonText: "Nâng cấp Pro",
        highlighted: true,
    },
    {
        name: "Studio",
        price: "$49",
        duration: "/tháng",
        desc: "Giải pháp toàn diện cho các đội ngũ thiết kế và dự án lớn.",
        features: [
            "Mọi tính năng của gói Pro",
            "Truy cập API lõi",
            "Đào tạo mô hình AI riêng",
            "Hỗ trợ kỹ thuật 24/7",
            "Không gian làm việc nhóm"
        ],
        buttonText: "Liên hệ tư vấn",
        highlighted: false,
    }
];

export function PricingSection() {
    return (
        <div id="pricing" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10"></div>

            <div className="text-center mb-24 max-w-3xl mx-auto relative">
                <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tighter text-white">
                    Sức mạnh không giới hạn. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Giá cả minh bạch.</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/50 font-light">
                    Chọn gói phù hợp nhất với nhu cầu sáng tạo của bạn. Hủy bất cứ lúc nào, không ràng buộc.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan, i) => (
                    <div
                        key={i}
                        className={`relative rounded-[32px] p-8 flex flex-col h-full transition-transform duration-500 hover:-translate-y-2 ${plan.highlighted
                                ? 'bg-gradient-to-b from-white/10 to-white/5 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]'
                                : 'bg-white/5 border border-white/10'
                            } backdrop-blur-xl`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                                Phổ biến nhất
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-white/50 text-sm h-10">{plan.desc}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{plan.price}</span>
                                {plan.duration && <span className="text-white/50">{plan.duration}</span>}
                            </div>
                        </div>

                        <ul className="mb-10 space-y-4 flex-1">
                            {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-white/80" />
                                    </div>
                                    <span className="text-white/80 text-sm leading-relaxed">{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className={`w-full py-6 rounded-xl font-bold text-lg transition-all ${plan.highlighted
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {plan.buttonText}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

# CHUẨN BỊ PHỎNG VẤN — Kỹ Sư Tích Hợp Hệ Thống AI Agent

> Học thuộc file này trước khi phỏng vấn. Mỗi câu trả lời được thiết kế để **map trực tiếp** vào JD.

---

## PHẦN 1: GIỚI THIỆU BẢN THÂN (30 giây — học thuộc)

> "Em là [tên], em vừa hoàn thành dự án cá nhân **ZDream5** — một nền tảng tạo ảnh AI full-stack. Trong dự án này em tự thiết kế và triển khai **hệ thống Multi-Agent AI** gồm 5 agent chuyên biệt, xây dựng **backend API** bằng Laravel, tích hợp **LLM qua OpenRouter**, và xử lý toàn bộ pipeline từ prompt optimization đến image generation. Em quan tâm đến việc xây dựng hệ thống AI phục vụ người dùng thật, không chỉ dừng ở mức demo."

**Câu cuối rất quan trọng** — nó match trực tiếp với JD: *"Có tư duy xây hệ thống cho người dùng thật, không chỉ demo."*

---

## PHẦN 2: MAP DỰ ÁN VÀO JD

JD yêu cầu gì → Em đã làm gì trong ZDream5:

```
┌─────────────────────────────────┬────────────────────────────────────┐
│ JD YÊU CẦU                     │ EM ĐÃ LÀM TRONG ZDREAM5           │
├─────────────────────────────────┼────────────────────────────────────┤
│ Xây dựng AI Agent nội bộ       │ 5 AI Agents chuyên biệt            │
│                                 │ (Generate, StyleTransfer,          │
│                                 │  Variation, AdImage, Character)    │
├─────────────────────────────────┼────────────────────────────────────┤
│ Thiết kế logic Agent theo       │ Pipeline 8 bước: validate →       │
│ workflow thực tế                │ deduct gems → upload → prompt      │
│                                 │ design → generate → save → refund  │
├─────────────────────────────────┼────────────────────────────────────┤
│ Ứng dụng LLM để hiểu ngữ cảnh │ PromptDesigner dùng LLM phân tích │
│                                 │ intent, reference images, template │
│                                 │ context → viết prompt tối ưu      │
├─────────────────────────────────┼────────────────────────────────────┤
│ AI đọc-hiểu tài liệu           │ Image-to-Prompt tool: AI phân     │
│ (PDF/Word/Excel)                │ tích ảnh → trích xuất mô tả.     │
│                                 │ (Tương tự RAG cho visual data)    │
├─────────────────────────────────┼────────────────────────────────────┤
│ Backend/API cho hệ thống AI    │ Laravel 12, RESTful API, 20+      │
│                                 │ endpoints, Service layer pattern   │
├─────────────────────────────────┼────────────────────────────────────┤
│ Hệ thống ổn định, dễ mở rộng  │ Pessimistic locking, graceful     │
│                                 │ fallback, partial failure handling,│
│                                 │ feature flags, model-agnostic     │
├─────────────────────────────────┼────────────────────────────────────┤
│ Prompt Engineering              │ 5 system prompts chuyên biệt,    │
│                                 │ structured output, context        │
│                                 │ building, negative prompt design  │
├─────────────────────────────────┼────────────────────────────────────┤
│ Framework AI Agent              │ Laravel AI framework + custom     │
│ (LangChain, LlamaIndex...)     │ Agent pattern (tương đương)       │
├─────────────────────────────────┼────────────────────────────────────┤
│ Git                             │ Git workflow, version control     │
├─────────────────────────────────┼────────────────────────────────────┤
│ Tư duy kỹ sư triển khai        │ Deduct-then-refund, race          │
│                                 │ condition prevention, SSRF        │
│                                 │ protection, audit trail           │
└─────────────────────────────────┴────────────────────────────────────┘
```

---

## PHẦN 3: CÂU HỎI DỰ ĐOÁN + TRẢ LỜI MẪU

### ═══════════════════════════════════════
### NHÓM A: VỀ AI AGENT (Trọng tâm phỏng vấn)
### ═══════════════════════════════════════

---

### Q1: "AI Agent là gì? Khác gì chatbot?"

> **A**: "Chatbot là hỏi-đáp 1 lượt: user hỏi → LLM trả lời. AI Agent phức tạp hơn — nó có **workflow nhiều bước**, có khả năng **ra quyết định**, **chọn công cụ phù hợp**, và **thực thi hành động**.
>
> Ví dụ trong dự án em: khi user yêu cầu tạo ảnh quảng cáo sản phẩm, hệ thống không chỉ gọi LLM 1 lần. Nó phải: **(1)** nhận diện đây là task advertising → **(2)** chọn AdImageDesigner agent → **(3)** agent phân tích ảnh sản phẩm (shape, branding, material) → **(4)** viết prompt theo platform-specific rules (Instagram 1:1, TikTok 9:16) → **(5)** gọi image model sinh ảnh → **(6)** lưu kết quả. Mỗi bước có logic riêng, có error handling riêng. Đó là Agent, không phải chatbot."

---

### Q2: "Giải thích kiến trúc Multi-Agent trong dự án?"

> **A**: "Em dùng pattern **Orchestrator + Specialized Agents**.
>
> **Orchestrator** là `PromptDesignerService` — nó nhận request, phân tích `taskType`, rồi chọn agent phù hợp. Giống như quản lý dự án phân công việc cho chuyên gia.
>
> **5 Specialized Agents**, mỗi agent có system prompt riêng:
> - **GenerateDesigner**: xử lý 90% traffic, có 4 analysis modes (text-only, reference+preserve, reference+transform, template-guided)
> - **StyleTransferDesigner**: giữ nguyên content, chỉ đổi rendering style (có knowledge base cho 6 art styles)
> - **VariationDesigner**: tạo biến thể — giữ identity, thay đổi 2-3 biến (camera angle, lighting, background)
> - **AdImageDesigner**: tối ưu cho quảng cáo thương mại, có rules theo platform (FB, TikTok, Shopee)
> - **CharacterDesigner**: giữ nhất quán nhân vật qua các scene, trích xuất facial blueprint
>
> **Tại sao không dùng 1 agent duy nhất?** Vì mỗi task cần instruction set hoàn toàn khác. Style Transfer cần preserve content + change style. Character cần preserve identity + change scene. Gộp vào 1 prompt quá dài, dễ conflict, khó maintain."

---

### Q3: "Structured Output là gì? Tại sao dùng?"

> **A**: "Structured Output là kỹ thuật **ép LLM trả về JSON theo schema cố định**, thay vì text tự do.
>
> Em khai báo schema: `{ prompt: string, negative_prompt: string }`. LLM provider đảm bảo response **luôn** khớp format này.
>
> **Tại sao?** Vì output của Agent là input cho bước tiếp theo (gọi image model). Nếu LLM trả text tự do, em phải regex parse — rất fragile, dễ break. Với Structured Output, em access trực tiếp `response['prompt']`, không bao giờ sai format. Đây là best practice khi build production AI system — không phải demo."

---

### Q4: "Prompt Engineering trong dự án em như thế nào?"

> **A**: "Em thiết kế system prompt cho từng agent theo methodology cụ thể:
>
> **1. Task Classification** — Agent đầu tiên phân loại request (text-only? reference-based? template-guided?) để chọn strategy phù hợp.
>
> **2. Subject-Specific Rules** — Prompt khác nhau cho product (commercial fidelity), person (preserve facial features), landscape (enhance atmosphere).
>
> **3. Prompt Structure** — Cấu trúc cố định: `[Subject] + [Setting] + [Lighting] + [Technical details] + [Style]`. Bắt buộc ≥3 technical details.
>
> **4. Negative Prompt Design** — Không chỉ positive prompt, agent còn viết negative prompt: base defects + subject-specific exclusions + user exclusions.
>
> **5. Anti-Double-Injection** — Khi Agent đã bake style vào prompt, em set `style: null` khi gọi image model để tránh trùng lặp (ví dụ: Agent viết 'anime style' trong prompt, mà OpenRouterService lại thêm 'Style: anime' nữa → kết quả bị over-styled)."

---

### Q5: "Luồng hoạt động hệ thống AI trong dự án?"

> **A**: "Em gọi nó là **Two-Layer AI Architecture**:
>
> **Layer 1 — Art Director** (text LLM, Gemini Flash): Nhận prompt thô của user + context (style, reference images, template) → viết prompt chuyên nghiệp 200-300 từ. Chi phí ~$0.001, latency 2-5s.
>
> **Layer 2 — Artist** (image LLM, Gemini Flash Image): Nhận prompt đã tối ưu → sinh ảnh. Chi phí ~$0.01-0.03, latency 10-30s.
>
> Layer 1 một mình chỉ viết được, không vẽ được. Layer 2 một mình vẽ được, nhưng chất lượng phụ thuộc prompt. Kết hợp: Layer 1 viết brief hoàn hảo, Layer 2 thực thi → ảnh đẹp hơn rõ rệt, user ít retry hơn, tiết kiệm API cost.
>
> Và Layer 1 có **graceful fallback**: nếu fail → dùng prompt gốc của user, không block flow."

---

### ═══════════════════════════════════════
### NHÓM B: VỀ BACKEND / SYSTEM DESIGN
### ═══════════════════════════════════════

---

### Q6: "Giải thích cách xử lý race condition trong hệ thống?"

> **A**: "Bài toán: 2 request cùng lúc, gems chỉ đủ 1 người. Nếu kiểm tra rồi mới trừ (check-then-act), cả 2 đều thấy đủ → cả 2 đều trừ → **âm gems**.
>
> Giải pháp: **Pessimistic Locking** — `SELECT ... FOR UPDATE` trong DB transaction. Request đầu lock row → kiểm tra → trừ → commit → unlock. Request 2 chờ lock → kiểm tra → không đủ → reject 422.
>
> **Tại sao pessimistic thay vì optimistic?** Vì đây là giao dịch tài chính, cần **consistency tuyệt đối**. Optimistic lock (version check + retry) phức tạp hơn và vẫn có window nhỏ cho inconsistency. Pessimistic lock đơn giản, đảm bảo ACID, thời gian lock rất ngắn (<50ms) nên không ảnh hưởng performance."

---

### Q7: "Xử lý lỗi như thế nào khi API AI bị fail?"

> **A**: "Em thiết kế theo nguyên tắc **deduct-then-refund** với **partial failure handling**:
>
> 1. Trừ gems TRƯỚC khi gọi API (đảm bảo không bao giờ tạo ảnh miễn phí)
> 2. Nếu ảnh đầu tiên fail → **break ngay** (fail fast, không chờ timeout thêm)
> 3. Nếu 2/3 ảnh thành công → trả 2 ảnh + refund gems cho 1 ảnh fail
> 4. Nếu toàn bộ fail → refund 100% + cleanup reference images trên MinIO
> 5. Mọi thao tác gems đều ghi **transaction ledger** → audit trail đầy đủ
>
> Nguyên tắc: **user không bao giờ mất tiền khi không nhận được sản phẩm**."

---

### Q8: "Tại sao chọn OpenRouter thay vì gọi thẳng API của Google/OpenAI?"

> **A**: "**Model-agnostic architecture**. OpenRouter là AI gateway — 1 API key, 1 endpoint, truy cập 200+ model. Khi muốn đổi model (Gemini → FLUX → DALL-E), em chỉ thay `model_id` trong database, không cần đổi code, không cần deploy lại.
>
> Trong doanh nghiệp điều này rất quan trọng: nếu 1 provider tăng giá hoặc bị down, chuyển sang provider khác trong vài giây. Giống như dùng load balancer cho AI."

---

### Q9: "Hệ thống có scale được không?"

> **A**: "Có. Em thiết kế stateless:
> - **Backend**: Sanctum token auth (không dùng session) → scale horizontally, đặt sau load balancer
> - **Storage**: MinIO (S3-compatible) → scale independently, migrate sang AWS S3 chỉ đổi .env
> - **AI**: OpenRouter tự load balance giữa providers
> - **Database**: Pessimistic lock chỉ lock 1 row/user → concurrent users không block nhau
> - **Sẵn sàng cho queue**: Architecture cho phép move image generation sang background job (Laravel Queue), trả response ngay, notify khi xong"

---

### ═══════════════════════════════════════
### NHÓM C: VỀ LLM / AI KNOWLEDGE
### ═══════════════════════════════════════

---

### Q10: "LLM là gì? Hoạt động thế nào?"

> **A**: "LLM — Large Language Model — là mô hình AI được train trên lượng text khổng lồ để hiểu và sinh ngôn ngữ tự nhiên. Về bản chất nó predict token tiếp theo dựa trên context.
>
> Trong dự án em, LLM có 2 vai trò:
> - **Text generation** (Layer 1): Gemini Flash nhận context → sinh prompt chuyên nghiệp
> - **Image generation** (Layer 2): Gemini Flash Image nhận prompt → sinh ảnh
>
> Em control output bằng: **temperature** (0.7 — đủ sáng tạo cho art), **max tokens** (2048), **structured output** (JSON schema), và **system prompt** (instruction set cho agent)."

---

### Q11: "RAG là gì? Em có dùng trong dự án không?"

> **A**: "RAG — Retrieval-Augmented Generation — là kỹ thuật kết hợp tìm kiếm dữ liệu với LLM: trước khi LLM trả lời, hệ thống **tìm kiếm tài liệu liên quan** → đưa vào context → LLM trả lời dựa trên dữ liệu thực, giảm hallucination.
>
> Trong ZDream5, em không dùng RAG truyền thống (text search), nhưng có **concept tương tự cho visual data**: khi user upload reference image, Agent nhận ảnh → phân tích (visual retrieval) → đưa vào context để viết prompt chính xác hơn. Template system cũng tương tự: template system_prompt là 'retrieved knowledge' được inject vào agent context.
>
> Em hiểu RAG pipeline đầy đủ: **Document loading → Chunking → Embedding → Vector store → Retrieval → LLM generation**. Nếu được, em rất muốn áp dụng để build hệ thống tra cứu tài liệu kỹ thuật cho doanh nghiệp — đúng với JD của vị trí này."

---

### Q12: "Nếu được giao xây dựng AI Agent tra cứu tài liệu nội bộ, em sẽ làm thế nào?"

> **A**: *(Câu này map trực tiếp vào mục 1.2 của JD — cực quan trọng)*
>
> "Em sẽ thiết kế theo kiến trúc tương tự ZDream5 nhưng cho document domain:
>
> **1. Data Pipeline**: PDF/Word/Excel → extract text (pdfplumber, python-docx, openpyxl) → chunking (theo heading hoặc fixed size 500-1000 tokens, overlap 100) → embedding (OpenAI ada-002 hoặc open-source sentence-transformers) → lưu vector store (Qdrant/Pinecone/pgvector)
>
> **2. Agent Layer**: Tương tự Multi-Agent của em — Orchestrator phân loại query:
> - Query tra cứu tiêu chuẩn kỹ thuật → TechnicalStandardAgent
> - Query về hồ sơ dự án → ProjectDocAgent
> - Query tổng hợp báo cáo → ReportAgent
>
> **3. Retrieval**: User hỏi → embed query → vector similarity search → lấy top-K chunks liên quan → inject vào LLM context
>
> **4. Response**: LLM trả lời dựa trên tài liệu thực + citation (trích dẫn nguồn)
>
> **5. Quality**: Feedback loop để cải thiện — user đánh giá answer → tune retrieval threshold, chunk size"

---

### Q13: "Em biết gì về LangChain / LlamaIndex?"

> **A**: "LangChain là framework Python/JS để build ứng dụng LLM — cung cấp abstraction cho chains, agents, tools, memory, retrieval. LlamaIndex (trước là GPT Index) chuyên về RAG — tối ưu cho indexing và querying tài liệu.
>
> Trong ZDream5 em dùng **Laravel AI** — framework tương đương trong hệ sinh thái PHP: có Agent pattern, Structured Output, Provider abstraction. Concept giống nhau: agent có system prompt, có tools, có structured output.
>
> Em đang tự học thêm LangChain và sẵn sàng apply vào Python stack nếu team dùng Python."

---

### ═══════════════════════════════════════
### NHÓM D: CÂU HỎI TÌNH HUỐNG / TƯ DUY
### ═══════════════════════════════════════

---

### Q14: "Khó khăn lớn nhất khi làm dự án là gì?"

> **A**: "**Prompt Engineering cho Multi-Agent**. Ban đầu em dùng 1 system prompt chung cho tất cả task — kết quả không tốt vì style transfer cần instruction khác hoàn toàn so với character consistency.
>
> Em phải iterate nhiều lần: test từng agent với hàng trăm prompt khác nhau, phân tích output, tinh chỉnh system prompt. Ví dụ CharacterDesigner ban đầu hay bị 'identity drift' — nhân vật đổi khuôn mặt khi đổi scene. Em phải thêm 'Character Identity Blueprint' — bắt agent mô tả face, hair, body chi tiết trước — mới giải quyết được.
>
> Bài học: **AI system không phải code xong là chạy — cần iteration và evaluation liên tục**."

---

### Q15: "Nếu LLM trả lời sai hoặc hallucinate thì sao?"

> **A**: "Em xử lý ở nhiều tầng:
>
> **1. Structured Output**: Ép format JSON cứng — LLM không thể trả sai cấu trúc.
>
> **2. Validation**: Kiểm tra `response['prompt']` không empty. Nếu empty → fallback to original prompt.
>
> **3. Graceful Degradation**: Nếu Agent fail hoàn toàn (timeout, error) → hệ thống vẫn hoạt động bằng prompt gốc. User không bao giờ bị block.
>
> **4. Scoped Agent**: Mỗi agent chỉ làm 1 việc duy nhất (viết prompt), không có quyền thực thi hành động nguy hiểm. Worst case hallucination = prompt không tốt → ảnh xấu → user retry. Không gây thiệt hại tài chính hay data."

---

### Q16: "Tại sao em chọn vị trí này?"

> **A**: "Em thấy vị trí này match chính xác với những gì em đang làm và muốn phát triển. Em đã tự xây dựng hệ thống AI Agent thực tế, hiểu pipeline từ đầu đến cuối. Và JD nói rõ 'xây hệ thống cho người dùng thật, không chỉ demo' — đó chính xác là mindset của em.
>
> Em muốn apply kinh nghiệm Multi-Agent và backend vào domain mới — tra cứu tài liệu kỹ thuật, hỗ trợ kỹ sư — là bài toán RAG rất thú vị. Và em thấy cơ hội phát triển theo hướng AI System Architect rất phù hợp với mục tiêu dài hạn."

---

## PHẦN 4: TÓM TẮT DỰ ÁN — HỌC THUỘC (1 PHÚT)

> **ZDream5** là nền tảng tạo ảnh AI full-stack mà em tự thiết kế và phát triển.
>
> **Kiến trúc AI** gồm 2 tầng: **Tầng 1** — hệ thống Multi-Agent (5 agent chuyên biệt) dùng text LLM để tối ưu prompt — giống "Art Director" viết brief. **Tầng 2** — image LLM sinh ảnh từ prompt đã tối ưu — giống "Artist" thực thi.
>
> **Orchestrator** (`PromptDesignerService`) phân tích task type → chọn agent phù hợp → build context → gọi agent với Structured Output → nhận JSON `{prompt, negative_prompt}`.
>
> **5 Agents**: GenerateDesigner (tạo ảnh chung, 4 analysis modes), StyleTransferDesigner (đổi style giữ content), VariationDesigner (tạo biến thể), AdImageDesigner (ảnh quảng cáo theo platform), CharacterDesigner (giữ nhất quán nhân vật).
>
> **Backend** Laravel 12, 20+ RESTful endpoints, Service layer pattern. **An toàn tài chính** bằng pessimistic locking — trừ gems trước, hoàn sau nếu fail. **Resilience** với graceful fallback — nếu Agent fail, dùng prompt gốc, user không bị block. **Model-agnostic** qua OpenRouter — đổi AI model không cần deploy.
>
> **Storage** MinIO (S3-compatible), UUID naming chống path traversal, SSRF protection chỉ chấp nhận HTTPS.

---

## PHẦN 5: TỪ KHOÁ KỸ THUẬT CẦN NHỚ

Khi nói chuyện, cố gắng **tự nhiên** nhắc đến các từ khoá này:

| Từ khoá | Ngữ cảnh dùng |
|---------|---------------|
| **Multi-Agent** | "Em thiết kế hệ thống Multi-Agent gồm 5 agent..." |
| **Orchestrator Pattern** | "Orchestrator phân loại task rồi chọn agent..." |
| **Structured Output** | "Agent trả về JSON theo schema cố định..." |
| **Prompt Engineering** | "Mỗi agent có system prompt riêng với methodology..." |
| **Two-Layer AI** | "Tầng 1 text LLM, tầng 2 image LLM..." |
| **Graceful Fallback** | "Nếu agent fail, hệ thống vẫn hoạt động..." |
| **Pessimistic Locking** | "Chống race condition bằng SELECT FOR UPDATE..." |
| **Model-Agnostic** | "Đổi model chỉ cần thay model_id trong DB..." |
| **RAG** | "Em hiểu pipeline: chunking → embedding → retrieval..." |
| **Feature Flag** | "Bật/tắt PromptDesigner từ Admin, không cần deploy..." |
| **Deduct-then-Refund** | "Trừ trước, hoàn sau nếu fail — an toàn tài chính..." |
| **Partial Failure** | "2/3 ảnh thành công → trả 2 ảnh, refund 1..." |

---

## PHẦN 6: CÂU HỎI EM NÊN HỎI NGƯỢC (Cuối buổi phỏng vấn)

1. "Hiện tại team đang dùng LLM nào và framework gì cho AI Agent?"
2. "Hệ thống tài liệu nội bộ hiện tại được lưu trữ dạng gì? (PDF, database, wiki?)"
3. "AI Agent hiện tại đã deploy chưa hay đang ở giai đoạn xây dựng từ đầu?"
4. "Team size bao nhiêu người và quy trình phát triển thế nào?"

---

## PHẦN 7: NHỮNG ĐIỂM YẾU CẦN CHUẨN BỊ

### "Em chưa dùng Python?" (JD yêu cầu thành thạo Python)

> "Em có nền tảng lập trình vững chắc với PHP/TypeScript. Concept AI Agent, Prompt Engineering, Structured Output, RAG pipeline — em đã hiểu sâu và áp dụng thực tế. Python syntax em đang học thêm và có thể pick up nhanh vì logic đã nắm rõ. Framework như LangChain em đã đọc docs và hiểu kiến trúc — chỉ cần thời gian ngắn để thành thạo hands-on."

### "Em chưa dùng LangChain / LlamaIndex?"

> "Em dùng Laravel AI — concept tương đương: Agent, Provider abstraction, Structured Output, Multi-modal. Kiến trúc Multi-Agent em thiết kế trong ZDream5 tương tự LangChain Agent với custom tools. Em đã đọc LangChain docs và hiểu kiến trúc chain/agent/tool/memory. Với foundation này, em tự tin pick up LangChain nhanh."

### "Em chưa có kinh nghiệm RAG?"

> "Em chưa triển khai RAG production, nhưng em hiểu đầy đủ pipeline: document loading → text extraction → chunking → embedding → vector store → retrieval → LLM generation → citation. Và trong ZDream5 em đã làm concept tương tự cho visual data — inject reference context vào agent. Chuyển sang text-based RAG cho tài liệu kỹ thuật là bước logic tiếp theo."

# ZDream5 — Multi-Agent AI Workflow

> Phân tích chi tiết hệ thống Multi-Agent: kiến trúc, luồng xử lý, chiến lược từng agent, và cách orchestrator điều phối.

---

## 1. Tổng Quan Kiến Trúc Agent

```
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR PATTERN                           │
│                                                                  │
│            PromptDesignerService (Orchestrator)                   │
│                        │                                         │
│          ┌─────────────┼─────────────┐                           │
│          │             │             │                            │
│     ┌────┴────┐   ┌───┴────┐   ┌───┴──────┐                    │
│     │ Resolve │   │ Build  │   │  Build   │                    │
│     │  Agent  │   │ Context│   │Attachments│                   │
│     └────┬────┘   └───┬────┘   └───┬──────┘                    │
│          │            │            │                             │
│          ▼            ▼            ▼                             │
│     ┌─────────────────────────────────────┐                     │
│     │        agent.prompt(text, images)    │                     │
│     │        → Structured Output JSON      │                     │
│     └──────────────────┬──────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│              { prompt, negative_prompt }                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Agent Selection (Strategy Pattern)

```
                    taskType (from request)
                            │
                            ▼
              ┌─────────────────────────────┐
              │     resolveAgent(taskType)   │
              └──────────────┬──────────────┘
                             │
            ┌────────────────┼────────────────────────────┐
            │                │                │            │
     ┌──────┴──────┐  ┌─────┴──────┐  ┌─────┴─────┐ ┌───┴────┐
     │  generate   │  │   style-   │  │ variation │ │ad-image│
     │  template   │  │  transfer  │  │           │ │        │
     └──────┬──────┘  └─────┬──────┘  └─────┬─────┘ └───┬────┘
            │               │               │           │
            ▼               ▼               ▼           ▼
     ┌──────────┐    ┌───────────┐   ┌──────────┐ ┌─────────┐
     │ Generate │    │  Style    │   │Variation │ │   Ad    │
     │ Designer │    │ Transfer  │   │ Designer │ │ Image   │
     │          │    │ Designer  │   │          │ │Designer │
     └──────────┘    └───────────┘   └──────────┘ └─────────┘

                                                  ┌──────────┐
                                        character │Character │
                                        ─────────►│ Designer │
                                                  └──────────┘

     Mapping:
     ─────────────────────────────────────────────────
     'generate'       → GenerateDesigner
     'template'       → GenerateDesigner (same agent)
     'style-transfer' → StyleTransferDesigner
     'variation'      → VariationDesigner
     'ad-image'       → AdImageDesigner
     'character'      → CharacterDesigner
     default          → GenerateDesigner
```

**Tại sao `generate` và `template` dùng cùng 1 agent?**

Template chỉ thêm `templateSystemPrompt` vào context — GenerateDesigner đã có logic xử lý `TEMPLATE-GUIDED generation` trong analysis framework. Không cần agent riêng.

---

## 3. Agent Inheritance (Class Diagram)

```
                    ┌──────────────────────────────┐
                    │     Laravel AI Agent          │
                    │     (Framework Interface)     │
                    └──────────────┬───────────────┘
                                   │ extends
                    ┌──────────────┴───────────────┐
                    │     BasePromptDesigner        │
                    │     (Abstract Base Class)     │
                    │                              │
                    │  Attributes:                 │
                    │  ├─ @Provider('openrouter')   │
                    │  ├─ @Temperature(0.7)         │
                    │  ├─ @MaxTokens(2048)          │
                    │  ├─ @Timeout(30)              │
                    │  │                            │
                    │  Schema (Structured Output):  │
                    │  ├─ prompt: string             │
                    │  │  "Optimized English prompt, │
                    │  │   under 300 words"          │
                    │  └─ negative_prompt: string    │
                    │     "What to exclude"          │
                    │                              │
                    │  Methods:                    │
                    │  ├─ withModel(model): self    │
                    │  ├─ prompt(text, attach): res │
                    │  └─ schema(): array           │
                    └──────────────┬───────────────┘
                                   │ extends
           ┌───────────┬───────────┼───────────┬──────────┐
           │           │           │           │          │
    ┌──────┴───┐ ┌─────┴────┐ ┌───┴────┐ ┌───┴───┐ ┌───┴────┐
    │ Generate │ │  Style   │ │Varia-  │ │  Ad   │ │Charac- │
    │ Designer │ │ Transfer │ │tion    │ │ Image │ │ter     │
    │          │ │ Designer │ │Designer│ │Designer│ │Designer│
    │          │ │          │ │        │ │       │ │        │
    │ ~2000w   │ │ ~600w    │ │ ~500w  │ │ ~700w │ │ ~800w  │
    │ system   │ │ system   │ │ system │ │system │ │ system │
    │ prompt   │ │ prompt   │ │ prompt │ │prompt │ │ prompt │
    └──────────┘ └──────────┘ └────────┘ └───────┘ └────────┘
```

---

## 4. Context Building Flow

Orchestrator xây dựng context trước khi gọi agent:

```
INPUT:
  userPrompt = "A cat sitting on a desk"
  style = "anime"
  negativePrompt = "dark, scary"
  templateSystemPrompt = null
  referenceImages = [url1, url2]
  aspectRatio = "16:9"
  taskType = "generate"

                    │
                    ▼

STEP 1: Classify Task Label
──────────────────────────────────────────────────────────
  taskType = 'generate'
  hasTemplate = false
  hasRefs = true (2 images)

  → taskLabel = "REFERENCE-BASED generation"

  Decision tree:
  ┌─ generate?
  │  ├─ hasTemplate? → "TEMPLATE-GUIDED generation"
  │  ├─ hasRefs?     → "REFERENCE-BASED generation"  ◄── this
  │  └─ neither?     → "TEXT-ONLY generation"
  │
  ├─ template?       → "TEMPLATE-GUIDED generation"
  ├─ style-transfer? → "STYLE TRANSFER"
  ├─ variation?      → "IMAGE VARIATION"
  ├─ ad-image?       → "ADVERTISING IMAGE"
  └─ character?      → "CONSISTENT CHARACTER"


STEP 2: Assemble Message Parts
──────────────────────────────────────────────────────────
  parts = []

  parts[] = "## Task: REFERENCE-BASED generation"
  parts[] = "User prompt: A cat sitting on a desk"
  parts[] = "Rendering style: anime"
  parts[] = "Aspect ratio: 16:9"
  parts[] = "User wants to AVOID: dark, scary"
  parts[] = ""
  parts[] = "## Reference Images (2 attached)"
  parts[] = "→ Image 1 = MAIN SUBJECT (preserve exactly)"
  parts[] = "→ Image 2 = style/mood/environment reference"


STEP 3: Build Attachments
──────────────────────────────────────────────────────────
  referenceImages = [
    "https://minio.../ref1.jpg"  → RemoteImage(url)
    "https://minio.../ref2.jpg"  → RemoteImage(url)
  ]

  Supports:
  ├─ https:// URL  → RemoteImage
  ├─ data:image/*  → Base64Image (parse mime + data)
  └─ raw base64    → Base64Image (default jpeg)

  Max: 6 attachments (cap to prevent abuse)


STEP 4: Call Agent
──────────────────────────────────────────────────────────
  agent = GenerateDesigner()
  agent.withModel('google/gemini-2.5-flash')

  response = agent.prompt(
    prompt: assembled_text,
    attachments: [RemoteImage, RemoteImage]
  )

  // Agent sees:
  // System: [its 2000-word system prompt with all rules]
  // User: [assembled context text + 2 images]
  // → Returns structured JSON


STEP 5: Extract Result
──────────────────────────────────────────────────────────
  response['prompt']          → optimized prompt string
  response['negative_prompt'] → negative prompt string

  if empty(prompt) → fallback to original user prompt
```

---

## 5. Từng Agent Chi Tiết

### 5.1 GenerateDesigner — The Generalist

```
┌─────────────────────────────────────────────────────────────────┐
│                    GenerateDesigner                               │
│                    (handles 90% of traffic)                       │
│                                                                  │
│  ANALYSIS FRAMEWORK (4 modes):                                  │
│  ════════════════════════════                                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ TEXT-ONLY                                               │    │
│  │ No reference images                                     │    │
│  │ Strategy: Full creative freedom                         │    │
│  │ → Invent vivid details (lighting, mood, composition)    │    │
│  │ → Add camera angle, color palette, textures             │    │
│  │                                                         │    │
│  │ Input:  "a cat sitting"                                 │    │
│  │ Output: "A majestic Persian cat sitting elegantly on    │    │
│  │          a velvet cushion, warm golden hour light from   │    │
│  │          a bay window, shallow depth of field, 85mm     │    │
│  │          portrait lens, cream and amber color palette,   │    │
│  │          soft bokeh background, oil painting style..."   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ REFERENCE + PRESERVE                                    │    │
│  │ Has reference image, user wants to KEEP subject         │    │
│  │ Strategy: Surgical precision on subject → design scene  │    │
│  │ → Describe subject exactly from reference               │    │
│  │ → Build environment around it                           │    │
│  │                                                         │    │
│  │ Input:  [photo of Nike shoe] + "in a forest"            │    │
│  │ Output: "A Nike Air Max 90 sneaker in infrared/white    │    │
│  │          colorway with visible Air unit, mesh upper,     │    │
│  │          Nike swoosh logo on lateral side — placed on    │    │
│  │          a moss-covered log in an enchanted forest,      │    │
│  │          dappled sunlight through canopy..."             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ REFERENCE + TRANSFORM                                   │    │
│  │ Has reference, user wants to CHANGE something           │    │
│  │ Strategy: Describe accurately, apply only changes       │    │
│  │                                                         │    │
│  │ Input:  [photo of room] + "make it night time"          │    │
│  │ Output: Exact room description + moonlight + city       │    │
│  │         lights through window + warm lamp glow...       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ TEMPLATE-GUIDED                                         │    │
│  │ Has template system_prompt                              │    │
│  │ Strategy: Template = PRIMARY style guide                │    │
│  │                                                         │    │
│  │ Priority resolution:                                    │    │
│  │ ├─ STYLE conflict  → template wins                     │    │
│  │ └─ SUBJECT conflict → user wins                        │    │
│  │                                                         │    │
│  │ Input:  template="Ghibli style" + "a girl in garden"   │    │
│  │ Output: Ghibli-specific techniques + user's subject     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  SUBJECT-SPECIFIC RULES:                                        │
│  ═══════════════════════                                        │
│                                                                  │
│  PRODUCT (perfume, shoes, food...)                               │
│  → Commercial fidelity NON-NEGOTIABLE                           │
│  → Shape, label, branding, material, color, proportions, finish │
│  → Studio lighting, reflections, shadows, textures              │
│                                                                  │
│  PERSON / PORTRAIT                                              │
│  → Preserve: facial features, skin tone, hair, clothing        │
│  → Enhance: pose, expression, lighting, background, DoF        │
│                                                                  │
│  SCENE / LANDSCAPE                                              │
│  → Preserve: composition, landmarks, spatial relationships     │
│  → Enhance: time of day, weather, atmosphere, color temp       │
│                                                                  │
│  ABSTRACT / ART                                                 │
│  → More creative freedom                                       │
│  → Preserve: core concept, dominant colors, emotional tone     │
│                                                                  │
│  PROMPT STRUCTURE:                                              │
│  [Subject] + [Setting] + [Lighting & Mood]                     │
│            + [Technical details] + [Style & Medium]             │
│                                                                  │
│  Must include ≥3 technical details:                             │
│  Camera | Lighting | Color | Material/Texture | Composition     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 StyleTransferDesigner

```
┌─────────────────────────────────────────────────────────────────┐
│                   StyleTransferDesigner                           │
│                                                                  │
│  CORE PRINCIPLE: Content stays. Style changes.                  │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │   PRESERVE       │     │    CHANGE         │                  │
│  │ (describe exact) │     │ (apply new style) │                  │
│  ├──────────────────┤     ├──────────────────┤                  │
│  │ Every subject    │     │ Rendering method  │                  │
│  │ Position & size  │     │ Texture/surface   │                  │
│  │ Spatial layout   │     │ Color palette     │                  │
│  │ Background       │     │ Edge quality      │                  │
│  │ Color relations  │     │ Detail level      │                  │
│  │ Text & logos     │     │                    │                  │
│  │ Lighting dir.    │     │                    │                  │
│  └──────────────────┘     └──────────────────┘                  │
│                                                                  │
│  STYLE KNOWLEDGE BASE:                                          │
│  ══════════════════════                                          │
│                                                                  │
│  ┌─────────┬──────────────────────────────────────────────┐     │
│  │ ANIME   │ Cel-shading, bold outlines, vibrant flat     │     │
│  │         │ colors, large expressive eyes, manga lines   │     │
│  ├─────────┼──────────────────────────────────────────────┤     │
│  │ OIL     │ Visible brushstrokes, impasto texture,       │     │
│  │PAINTING │ warm color temp, Renaissance lighting,       │     │
│  │         │ canvas texture, painterly blending           │     │
│  ├─────────┼──────────────────────────────────────────────┤     │
│  │WATER-   │ Wet-on-wet bleeding, transparent washes,     │     │
│  │ COLOR   │ white paper showing through, splatters       │     │
│  ├─────────┼──────────────────────────────────────────────┤     │
│  │CYBER-   │ Neon (pink/cyan/purple), rain-slicked,       │     │
│  │ PUNK    │ holographic, chromatic aberration, dark      │     │
│  ├─────────┼──────────────────────────────────────────────┤     │
│  │ PIXEL   │ Strict grid, 16-32 colors, dithering,       │     │
│  │  ART    │ no anti-aliasing, retro game aesthetic       │     │
│  ├─────────┼──────────────────────────────────────────────┤     │
│  │  3D     │ Ray tracing, subsurface scattering,          │     │
│  │ RENDER  │ ambient occlusion, PBR materials, HDRI      │     │
│  └─────────┴──────────────────────────────────────────────┘     │
│                                                                  │
│  EXAMPLE FLOW:                                                  │
│                                                                  │
│  Input: [photo of a park bench at sunset] + target: "anime"     │
│                                                                  │
│  Agent output:                                                  │
│  prompt: "Anime cel-shaded rendering of a wooden park bench     │
│   under a large oak tree at sunset, exact same composition      │
│   and layout as reference, bold black outlines, vibrant flat    │
│   color fills, warm orange and purple sky with simplified       │
│   cloud shapes, dappled light through anime-style foliage,     │
│   clean cel-shading shadows, Studio Ghibli color palette..."   │
│                                                                  │
│  Metaphor: "Different artist paints the same photograph"        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 VariationDesigner

```
┌─────────────────────────────────────────────────────────────────┐
│                    VariationDesigner                              │
│                                                                  │
│  CORE PRINCIPLE: Same concept, fresh execution.                 │
│  Metaphor: "B-take from the same photo shoot"                   │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │  KEEP CONSTANT   │     │  VARY (pick 2-3) │                  │
│  ├──────────────────┤     ├──────────────────┤                  │
│  │ Subject identity │     │ Camera angle     │                  │
│  │ Art style        │     │  (±15-45°)       │                  │
│  │ Overall mood     │     │ Lighting setup   │                  │
│  │ Color palette    │     │ Background       │                  │
│  │ Quality level    │     │ Pose/arrangement │                  │
│  │ Aspect ratio     │     │ Time of day      │                  │
│  │                  │     │ Micro-details    │                  │
│  │                  │     │ Expression       │                  │
│  │                  │     │ Depth of field   │                  │
│  └──────────────────┘     └──────────────────┘                  │
│                                                                  │
│  QUALITY SPECTRUM:                                              │
│                                                                  │
│  ✗ "Same image"    ←──── Target zone ────►  ✗ "Different image"│
│  (copy, no value)    "Same series"          (lost identity)     │
│                      ◄══════════►                                │
│                       Sweet spot                                │
│                                                                  │
│  EXAMPLE:                                                       │
│  Input:  [Portrait of woman in red dress, studio, front view]   │
│  Varied: Same woman, red dress, studio                          │
│          BUT: 30° angle shift, side lighting, different         │
│          background gradient, slight head tilt                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 AdImageDesigner

```
┌─────────────────────────────────────────────────────────────────┐
│                     AdImageDesigner                              │
│                                                                  │
│  CORE PRINCIPLE: Product is the hero. Everything serves sale.   │
│                                                                  │
│  PRODUCT ANALYSIS PIPELINE:                                     │
│  ══════════════════════════                                      │
│                                                                  │
│  [Reference Image] → Agent extracts:                            │
│  ┌───────────────────────────────────────┐                      │
│  │ Shape ─────────── round bottle        │                      │
│  │ Color ─────────── gold metallic       │                      │
│  │ Material ──────── glass, glossy       │                      │
│  │ Label text ────── "CHANEL N°5"        │                      │
│  │ Logo placement ── center front        │                      │
│  │ Packaging ─────── rectangular box     │                      │
│  │ Selling points ── premium, luxury     │                      │
│  └───────────────────────────────────────┘                      │
│                                                                  │
│  COMPOSITION RULES:                                             │
│  ┌──────────────────────────────────────────┐                   │
│  │  ┌─── Text-safe zone (top 20%) ───────┐ │                   │
│  │  │  Room for headline overlay          │ │                   │
│  │  ├─────────────────────────────────────┤ │                   │
│  │  │                                     │ │                   │
│  │  │     ┌─────────────┐                 │ │                   │
│  │  │     │             │                 │ │                   │
│  │  │     │   PRODUCT   │  40-60%        │ │                   │
│  │  │     │   (hero)    │  of frame      │ │                   │
│  │  │     │             │                 │ │                   │
│  │  │     └─────────────┘                 │ │                   │
│  │  │                                     │ │                   │
│  │  ├─── Text-safe zone (bottom 20%) ────┤ │                   │
│  │  │  Room for CTA/price overlay         │ │                   │
│  │  └─────────────────────────────────────┘ │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                  │
│  PLATFORM OPTIMIZATION:                                         │
│  ┌──────────┬────────┬───────────────────────────┐              │
│  │ Platform │ Ratio  │ Strategy                   │              │
│  ├──────────┼────────┼───────────────────────────┤              │
│  │ FB/IG    │ 1:1    │ Eye-catching from scroll   │              │
│  │ Feed     │ 4:5    │                            │              │
│  ├──────────┼────────┼───────────────────────────┤              │
│  │ Stories  │ 9:16   │ Product prominent center   │              │
│  │ Reels    │        │                            │              │
│  ├──────────┼────────┼───────────────────────────┤              │
│  │ TikTok   │ 9:16   │ Dynamic angle, lifestyle  │              │
│  ├──────────┼────────┼───────────────────────────┤              │
│  │ Shopee   │ 1:1    │ Clean white/gradient bg,  │              │
│  │ Lazada   │        │ product fills frame        │              │
│  └──────────┴────────┴───────────────────────────┘              │
│                                                                  │
│  MOOD BY CATEGORY:                                              │
│  ┌──────────┬────────────────────────────────────┐              │
│  │ Premium  │ Dark moody, gold/silver accents     │              │
│  │ Food     │ Fresh, droplets/steam, macro detail │              │
│  │ Beauty   │ Soft glow, pastel/jewel tones       │              │
│  │ Tech     │ Sleek, futuristic, blue/cool tones  │              │
│  │ Fashion  │ Editorial, aspirational setting     │              │
│  └──────────┴────────────────────────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 CharacterDesigner

```
┌─────────────────────────────────────────────────────────────────┐
│                   CharacterDesigner                              │
│                                                                  │
│  CORE PRINCIPLE: Character identity is SACRED.                  │
│                                                                  │
│  CHARACTER IDENTITY BLUEPRINT:                                  │
│  ═════════════════════════════                                   │
│                                                                  │
│  [Reference Images] → Agent extracts:                           │
│                                                                  │
│  ┌── FACE (Highest Priority) ─────────────────────────────┐    │
│  │ Face shape: oval / round / square / heart / angular     │    │
│  │ Eyes: shape, size, color, spacing, eyebrow              │    │
│  │ Nose: shape, size, bridge width, tip                    │    │
│  │ Mouth: lip shape, size, default expression              │    │
│  │ Skin: tone, texture, marks (freckles, moles, scars)    │    │
│  │ Facial hair: style, length, color                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌── HAIR ────────────────────────────────────────────────┐    │
│  │ Style: specific cut, length, volume                     │    │
│  │ Color: exact shade, highlights, roots                   │    │
│  │ Texture: straight / wavy / curly / coily                │    │
│  │ Parting: side / center / none                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌── BODY ────────────────────────────────────────────────┐    │
│  │ Build: slim / athletic / average / heavy                │    │
│  │ Height impression, proportions                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌── CLOTHING ("the uniform") ────────────────────────────┐    │
│  │ Signature outfit pieces, color scheme                   │    │
│  │ Accessories: glasses, jewelry, hat, watch               │    │
│  │ Style archetype: casual / formal / streetwear           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌── DISTINGUISHING FEATURES ─────────────────────────────┐    │
│  │ Tattoos, piercings, scars, birthmarks                   │    │
│  │ Signature pose or expression tendency                   │    │
│  │ Color associations                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PROMPT CONSTRUCTION:                                           │
│  ═══════════════════                                            │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │ [Character Blueprint] ← 40-60% of prompt│                   │
│  │ "the same person",                      │                    │
│  │ "maintaining exact facial features"     │                    │
│  ├─────────────────────────────────────────┤                    │
│  │ [New Scene / Pose / Context]            │                    │
│  │ Natural placement in environment        │                    │
│  │ Lighting adapted to match scene         │                    │
│  ├─────────────────────────────────────────┤                    │
│  │ [Consistent Art Style]                  │                    │
│  │ Same rendering as reference             │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  CONSTANT vs VARIABLE:                                          │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ CONSTANT (always) │  │ VARIABLE (user)  │                    │
│  │ Face              │  │ Scene            │                    │
│  │ Hair              │  │ Pose             │                    │
│  │ Body              │  │ Lighting         │                    │
│  │ Identity markers  │  │ Expression       │                    │
│  │ Art style         │  │ Outfit (if asked)│                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  SUCCESS CRITERIA:                                              │
│  "Anyone who knows this character should IMMEDIATELY             │
│   recognize them — in any scene, pose, or lighting."            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Two-Layer AI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   USER INPUT                                                    │
│   "con mèo cute"                                               │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────────────────────────────────────┐          │
│   │            AI LAYER 1 — "ART DIRECTOR"            │          │
│   │                                                    │          │
│   │  Model: google/gemini-2.5-flash (text LLM)       │          │
│   │  Role: Understand intent → Write professional brief│         │
│   │  Cost: ~0.1¢ per call                             │          │
│   │  Latency: ~2-5 seconds                            │          │
│   │                                                    │          │
│   │  Input:  "con mèo cute" + context                 │          │
│   │  Output: "A fluffy Scottish Fold kitten with      │          │
│   │           round amber eyes, sitting on a cloud-    │          │
│   │           soft white blanket, soft diffused        │          │
│   │           natural light from above, shallow DoF,   │          │
│   │           macro lens 100mm, pastel pink and white  │          │
│   │           color palette, dreamy ethereal mood..."  │          │
│   └──────────────────────┬───────────────────────────┘          │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────────┐          │
│   │            AI LAYER 2 — "ARTIST"                  │          │
│   │                                                    │          │
│   │  Model: google/gemini-2.5-flash-image (image LLM)│          │
│   │  Role: Execute the brief → Generate pixel-perfect │          │
│   │  Cost: ~1-3¢ per image                            │          │
│   │  Latency: ~10-30 seconds                          │          │
│   │                                                    │          │
│   │  Input:  Optimized prompt from Layer 1            │          │
│   │  Output: base64 PNG image                         │          │
│   └──────────────────────┬───────────────────────────┘          │
│                          │                                       │
│                          ▼                                       │
│   [High-quality image of a fluffy kitten]                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

WHY TWO LAYERS?
───────────────────────────────────────────────────────────
Layer 1 alone: Can write amazing prompts, but cannot draw.
Layer 2 alone: Can draw, but only as good as the prompt it gets.
Together: Layer 1 writes the perfect brief, Layer 2 executes it.

The quality difference is dramatic:
  Without Layer 1: generic cat image, flat lighting, no personality
  With Layer 1:    specific breed, mood, camera angle, color palette
```

---

## 7. Fallback & Resilience Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                GRACEFUL DEGRADATION CHAIN                        │
│                                                                  │
│  Level 0: Full Pipeline (optimal)                               │
│  ──────────────────────────────                                 │
│  PromptDesigner ON + OpenRouter OK                              │
│  → Best quality, optimized prompts                              │
│                                                                  │
│          │ PromptDesigner fails?                                 │
│          ▼                                                       │
│  Level 1: Bypass Designer (degraded)                            │
│  ────────────────────────────────                               │
│  PromptDesigner OFF or error → use raw user prompt              │
│  OpenRouter still works                                         │
│  → Lower quality but still generates images                     │
│  → User never sees an error from the optimizer                  │
│                                                                  │
│          │ OpenRouter fails?                                    │
│          ▼                                                       │
│  Level 2: Full Failure (safe)                                   │
│  ────────────────────────────                                   │
│  API error or timeout                                           │
│  → Refund 100% gems automatically                               │
│  → Clean up uploaded files                                      │
│  → Clear error message to user                                  │
│  → No money lost, no orphaned data                              │
│                                                                  │
│                                                                  │
│  FEATURE FLAG:                                                  │
│  ┌──────────────────────────────┐                               │
│  │ Setting: prompt_designer_enabled                             │
│  │                              │                               │
│  │  '1' (default) → Layer 1 ON │                               │
│  │  '0'           → Layer 1 OFF│                               │
│  │                              │                               │
│  │ Changeable from Admin panel  │                               │
│  │ No deploy needed             │                               │
│  └──────────────────────────────┘                               │
│                                                                  │
│  MODEL SWAPPABLE:                                               │
│  ┌──────────────────────────────┐                               │
│  │ Setting: prompt_designer_model                               │
│  │                              │                               │
│  │ Default: google/gemini-2.5-flash                             │
│  │ Can swap to: anthropic/claude                                │
│  │              openai/gpt-4o                                   │
│  │              meta/llama-3                                    │
│  │                              │                               │
│  │ Change from Admin, instant   │                               │
│  └──────────────────────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Tool → Agent Mapping (Complete)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  FRONTEND ACTION          BACKEND ROUTE            AGENT USED    │
│  ═══════════════          ═════════════            ══════════     │
│                                                                   │
│  Generate Page                                                   │
│  ├─ Text only         POST /images/generate    GenerateDesigner  │
│  ├─ With reference    POST /images/generate    GenerateDesigner  │
│  └─ With template     POST /images/generate    GenerateDesigner  │
│                                                                   │
│  AI Tools                                                        │
│  ├─ Style Transfer    POST /tools/style-transfer  StyleTransfer  │
│  ├─ Image Variation   POST /tools/image-variation Variation      │
│  ├─ Ad Image          POST /tools/ad-image        AdImage        │
│  ├─ Character         POST /tools/consistent-..   Character      │
│  ├─ Upscale           POST /tools/upscale         (none)        │
│  ├─ Remove BG         POST /tools/remove-bg       (none)        │
│  ├─ Remove Object     POST /tools/remove-object   (none)        │
│  ├─ Inpainting        POST /tools/inpainting      (none)        │
│  ├─ Extend            POST /tools/extend           (none)        │
│  └─ Image to Prompt   POST /tools/image-to-prompt (none)*       │
│                                                                   │
│  * Image to Prompt uses OpenRouterService.analyzeImage()         │
│    with a hardcoded system prompt — not an Agent                 │
│                                                                   │
│  (none) = Direct prompt → OpenRouter, no optimization needed     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Designed Prompt Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│               PROMPT LINEAGE IN DATABASE                         │
│                                                                  │
│  images table:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ prompt          │ "con mèo cute"                           │ │
│  │                 │ (user's original — always preserved)     │ │
│  ├─────────────────┼──────────────────────────────────────────┤ │
│  │ designed_prompt │ "A fluffy Scottish Fold kitten with      │ │
│  │                 │  round amber eyes, sitting on a cloud-   │ │
│  │                 │  soft white blanket..."                   │ │
│  │                 │ (AI-optimized — NULL if designer off)    │ │
│  ├─────────────────┼──────────────────────────────────────────┤ │
│  │ negative_prompt │ "blurry, distorted, low quality..."      │ │
│  │                 │ (from agent or user or both merged)      │ │
│  └─────────────────┴──────────────────────────────────────────┘ │
│                                                                  │
│  Benefits:                                                      │
│  ├─ User sees their original prompt in Library                  │
│  ├─ Developers can compare original vs designed for QA          │
│  ├─ If designed_prompt is NULL → designer was off/failed        │
│  └─ Can train better agents by analyzing prompt pairs           │
│                                                                  │
│  In ImageController:                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ // Flag from service — avoid string comparison            │   │
│  │ $wasDesigned = $designResult['designed'] ?? false;        │   │
│  │                                                           │   │
│  │ // Only send style/negative to OpenRouter if NOT designed │   │
│  │ // (Agent already baked these into designed_prompt)        │   │
│  │ generateImage(                                            │   │
│  │   negativePrompt: $wasDesigned ? null : $designedNeg,    │   │
│  │   style: $wasDesigned ? null : $style,                   │   │
│  │ )                                                         │   │
│  │                                                           │   │
│  │ // Prevents DOUBLE INJECTION:                             │   │
│  │ // Agent already wrote "anime style" in prompt            │   │
│  │ // Don't let OpenRouterService add "Style: anime" again   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────┐
│                   LATENCY BREAKDOWN                              │
│                                                                  │
│  Step                          Typical      Max                  │
│  ──────────────────────────    ─────────    ──────               │
│  Validate + calc cost          < 5ms        10ms                │
│  Deduct gems (with lock)       10-50ms      200ms               │
│  Upload references to MinIO    100-500ms    2s (per image)      │
│  PromptDesigner (Layer 1)      2-5s         30s (timeout)       │
│  OpenRouter image gen (Layer 2) 10-30s      120s (timeout)      │
│  Save to MinIO + DB            50-200ms     1s                  │
│  ──────────────────────────    ─────────    ──────               │
│  TOTAL (1 image)               ~15-35s      ~155s               │
│  TOTAL (4 images)              ~50-120s     ~500s               │
│                                                                  │
│  Bottleneck: OpenRouter image generation (Layer 2)              │
│  → 80-90% of total time                                        │
│  → Out of our control (depends on AI provider load)             │
│                                                                  │
│  Optimization: PromptDesigner cost is negligible               │
│  → 2-5s for significantly better image quality                  │
│  → ROI: fewer retries = fewer API calls = lower cost            │
│                                                                  │
│  API COSTS (per call):                                          │
│  ┌──────────────────────┬──────────┐                            │
│  │ PromptDesigner call  │ ~$0.001  │ (text-only, cheap)        │
│  │ Image generation     │ ~$0.01-03│ (depends on model)        │
│  │ Image to Prompt      │ ~$0.002  │ (vision + text)           │
│  └──────────────────────┴──────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

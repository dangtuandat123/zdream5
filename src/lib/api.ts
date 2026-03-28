/**
 * API Client — ZDream5
 *
 * HTTP wrapper cho tất cả API calls đến Laravel backend.
 * Tự động gắn Bearer token từ localStorage.
 * Xử lý 401 (hết phiên) bằng cách redirect về /login.
 */

const API_BASE = '/api';

/**
 * Lấy token từ localStorage
 */
function getToken(): string | null {
    return localStorage.getItem('auth_token');
}

/**
 * Lưu token vào localStorage
 */
export function setToken(token: string): void {
    localStorage.setItem('auth_token', token);
}

/**
 * Xoá token (đăng xuất)
 */
export function clearToken(): void {
    localStorage.removeItem('auth_token');
}

/**
 * Fetch wrapper với auth headers
 */
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    // Chỉ set JSON content-type nếu body không phải FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // Xử lý 401 — Token hết hạn hoặc không hợp lệ
    if (response.status === 401 && endpoint !== '/login') {
        clearToken();
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
    }

    // Xử lý lỗi validation (422)
    if (response.status === 422) {
        const errorData = await response.json();
        const firstError = errorData.errors
            ? Object.values(errorData.errors).flat()[0]
            : errorData.message;
        throw new Error(firstError as string);
    }

    // Xử lý lỗi khác
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            (errorData as { message?: string }).message || `Lỗi server: ${response.status}`
        );
    }

    return response.json();
}

// ========================
// Auth API
// ========================

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    gems: number;
    avatar: string | null;
    level: number;
    created_at?: string;
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
    token: string;
}

export const authApi = {
    register: (data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => request<AuthResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    login: (data: { email: string; password: string }) =>
        request<AuthResponse>('/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () => request<{ message: string }>('/logout', { method: 'POST' }),

    getUser: () => request<{ user: AuthUser }>('/user'),
};

// ========================
// Image API
// ========================

export interface GeneratedImageData {
    id: number;
    type: string;
    prompt: string;
    designed_prompt: string | null;
    negative_prompt: string | null;
    model: string;
    style: string;
    aspect_ratio: string;
    file_path: string;
    file_url: string;
    seed: number;
    gems_cost: number;
    reference_images: string[] | null;
    created_at: string;
}

export interface ProjectData {
    id: number;
    user_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface GenerateResponse {
    message: string;
    images: GeneratedImageData[];
    gems_remaining: number;
}

export interface UploadResponse {
    message: string;
    image: GeneratedImageData;
}

export const imageApi = {
    generate: (data: {
        project_id?: number | null;
        prompt: string;
        negative_prompt?: string;
        model?: string;
        style?: string;
        aspect_ratio?: string;
        image_size?: string;
        seed?: number;
        count?: number;
        reference_images?: string[];
        template_slug?: string;
    }) => request<GenerateResponse>('/images/generate', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    list: (page = 1, perPage = 20, projectId?: string | null, type?: string | null, templateSlug?: string | null, excludeTemplate = false) => {
        let url = `/images?page=${page}&per_page=${perPage}`;
        if (projectId) url += `&project_id=${projectId}`;
        if (type) url += `&type=${type}`;
        if (templateSlug) url += `&template_slug=${encodeURIComponent(templateSlug)}`;
        if (excludeTemplate) url += `&exclude_template=1`;
        return request<{
            data: GeneratedImageData[];
            current_page: number;
            last_page: number;
            total: number;
        }>(url);
    },

    upload: (file: File, projectId?: number | null) => {
        const formData = new FormData();
        formData.append('image', file);
        if (projectId) formData.append('project_id', projectId.toString());

        return request<UploadResponse>('/images/upload', {
            method: 'POST',
            body: formData,
            // Header Content-Type sẽ tự động được set bởi fetch khi dùng FormData
            headers: {}
        });
    },

    delete: (id: number) =>
        request<{ message: string }>(`/images/${id}`, { method: 'DELETE' }),
};

// ========================
// Project API
// ========================

export const projectApi = {
    list: () => request<{ data: ProjectData[] }>('/projects'),

    create: (data: { name: string }) =>
        request<{ message: string, data: ProjectData }>('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
};

// ========================
// Wallet API
// ========================

export interface TransactionData {
    id: number;
    type: 'topup' | 'spend';
    amount: number;
    balance_after: number;
    description: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export const walletApi = {
    show: () =>
        request<{ gems: number; transactions: TransactionData[] }>('/wallet'),

    topup: (data: { amount: number; package_name?: string }) =>
        request<{ message: string; gems: number; transaction: TransactionData }>(
            '/wallet/topup',
            { method: 'POST', body: JSON.stringify(data) }
        ),
};

// ========================
// Template API (Public)
// ========================

export interface EffectOption {
    value: string;
    label: string;
    prompt: string;
    image: string;
}

export interface EffectGroup {
    name: string;
    options: EffectOption[];
}

export interface TemplateData {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    system_prompt: string;
    model: string;
    thumbnail: string | null;
    effect_groups: EffectGroup[] | null;
}

export const templateApi = {
    list: () => request<{ data: TemplateData[] }>('/templates'),
    get: (slug: string) => request<TemplateData>(`/templates/${slug}`),
};

// ========================
// AI Model API (Public)
// ========================

export interface AiModelData {
    id: number;
    name: string;
    model_id: string;
    gems_cost: number;
}

export const modelApi = {
    listActive: () => request<{ data: AiModelData[] }>('/models'),
};

// ========================
// Admin API
// ========================

export interface AdminDashboardData {
    overview: {
        total_users: number;
        total_images: number;
        total_gems_spent: number;
        total_gems_topup: number;
    };
    users_over_time: Array<{ date: string; count: number }>;
    images_over_time: Array<{ date: string; count: number }>;
    recent_activity: Array<{
        id: number;
        user_id: number;
        prompt: string;
        file_url: string;
        model: string;
        gems_cost: number;
        created_at: string;
        user: { id: number; name: string; email: string; avatar: string | null };
    }>;
}

export interface AdminUserData {
    id: number;
    name: string;
    email: string;
    gems: number;
    avatar: string | null;
    level: number;
    images_count: number;
    created_at: string;
}

export interface AdminTemplateData extends TemplateData {
    is_active: boolean;
    sort_order: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface AdminAiModelData extends AiModelData {
    provider: string;
    is_active: boolean;
    sort_order: number;
    config: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export const adminApi = {
    // Dashboard
    dashboard: () => request<AdminDashboardData>('/admin/dashboard'),
    openrouterCredits: () => request<{ balance: number; usage: number; limit: number | null }>('/admin/openrouter-credits'),

    // Users
    users: (params?: { page?: number; per_page?: number; search?: string; level?: number }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set('page', String(params.page));
        if (params?.per_page) sp.set('per_page', String(params.per_page));
        if (params?.search) sp.set('search', params.search);
        if (params?.level !== undefined) sp.set('level', String(params.level));
        return request<{ data: AdminUserData[]; current_page: number; last_page: number; total: number }>(`/admin/users?${sp}`);
    },
    getUser: (id: number) => request<{ user: AdminUserData; recent_images: GeneratedImageData[]; transactions: TransactionData[] }>(`/admin/users/${id}`),
    updateUserLevel: (id: number, level: number) => request<{ message: string; user: AdminUserData }>(`/admin/users/${id}/level`, { method: 'PATCH', body: JSON.stringify({ level }) }),
    adjustGems: (id: number, data: { amount: number; reason: string }) => request<{ message: string; user: AdminUserData }>(`/admin/users/${id}/gems`, { method: 'POST', body: JSON.stringify(data) }),

    // Templates
    templates: (params?: { search?: string; category?: string }) => {
        const sp = new URLSearchParams();
        if (params?.search) sp.set('search', params.search);
        if (params?.category) sp.set('category', params.category);
        return request<AdminTemplateData[]>(`/admin/templates?${sp}`);
    },
    getTemplate: (id: number) => request<AdminTemplateData>(`/admin/templates/${id}`),
    createTemplate: (data: Record<string, unknown>) => request<{ message: string; data: AdminTemplateData }>('/admin/templates', { method: 'POST', body: JSON.stringify(data) }),
    updateTemplate: (id: number, data: Record<string, unknown>) => request<{ message: string; data: AdminTemplateData }>(`/admin/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTemplate: (id: number) => request<{ message: string }>(`/admin/templates/${id}`, { method: 'DELETE' }),
    reorderTemplates: (items: Array<{ id: number; sort_order: number }>) => request<{ message: string }>('/admin/templates/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
    uploadTemplateImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return request<{ url: string; path: string }>('/admin/templates/upload-image', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    },

    // AI Models
    models: () => request<AdminAiModelData[]>('/admin/models'),
    createModel: (data: Record<string, unknown>) => request<{ message: string; data: AdminAiModelData }>('/admin/models', { method: 'POST', body: JSON.stringify(data) }),
    updateModel: (id: number, data: Record<string, unknown>) => request<{ message: string; data: AdminAiModelData }>(`/admin/models/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteModel: (id: number) => request<{ message: string }>(`/admin/models/${id}`, { method: 'DELETE' }),
    toggleModel: (id: number) => request<{ message: string; data: AdminAiModelData }>(`/admin/models/${id}/toggle`, { method: 'PATCH' }),

    // Settings
    settings: () => request<Record<string, Array<{ id: number; key: string; value: string | null; group: string }>>>('/admin/settings'),
    updateSettings: (settings: Array<{ key: string; value: string | null; group?: string }>) => request<{ message: string }>('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
};

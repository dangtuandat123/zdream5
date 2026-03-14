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
    negative_prompt: string | null;
    model: string;
    style: string;
    aspect_ratio: string;
    file_path: string;
    file_url: string;
    seed: number;
    gems_cost: number;
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
        seed?: number;
        count?: number;
        reference_images?: string[];
    }) => request<GenerateResponse>('/images/generate', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    list: (page = 1, perPage = 20, projectId?: string | null, type?: string | null) => {
        let url = `/images?page=${page}&per_page=${perPage}`;
        if (projectId) url += `&project_id=${projectId}`;
        if (type) url += `&type=${type}`;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  token?: string;
  account?: T;
}

// Estrutura de erro padrão do backend
interface ApiError {
  detail?: string;
  title?: string;
  status?: number;
  instance?: string;
}

interface SignUpPayload {
  cpf: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: "RESIDENT" | "DOORMAN" | "SYNDIC" | "BUSINESS";
  condominiumCode: string;
  block?: string;
  apartmentNumber?: string;
}

interface SignInPayload {
  login: string;
  password: string;
}

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

const cleanCPF = (cpf: string) => cpf.replace(/\D/g, "");
const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

// Helper para processar respostas e tratar erros do backend
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    // Backend retorna: { detail, title, status, instance }
    const error = data as ApiError;
    const message = error.detail || error.title || getErrorMessage(response.status);
    return { success: false, message };
  }
  
  return { success: true, ...data };
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Dados inválidos. Verifique as informações.";
    case 401:
      return "Credenciais inválidas.";
    case 403:
      return "Acesso negado.";
    case 404:
      return "Recurso não encontrado.";
    case 409:
      return "Este registro já existe (e-mail ou usuário duplicado).";
    case 500:
      return "Erro interno do servidor. Tente novamente.";
    default:
      return "Erro ao processar requisição.";
  }
}

export async function signUp(data: SignUpPayload): Promise<ApiResponse> {
  const payload: SignUpPayload = {
    ...data,
    cpf: cleanCPF(data.cpf),
    phone: cleanPhone(data.phone),
  };

  if (data.role === "DOORMAN" || data.role === "BUSINESS") {
    delete payload.block;
    delete payload.apartmentNumber;
  }

  const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse(response);
}

export async function signIn(data: SignInPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const data_response = await response.json();
  
  if (!response.ok) {
    const error = data_response as ApiError;
    const message = error.detail || error.title || getErrorMessage(response.status);
    return { success: false, message };
  }
  
  return { success: true, token: data_response.token, ...data_response };
}

export async function logout(token: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function getMe(token: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Backend retorna: { detail, title, status, instance }
    const error = (data || {}) as ApiError;
    const message = error.detail || error.title || getErrorMessage(response.status);
    return { success: false, message };
  }

  // Alguns endpoints podem responder 200 com { success:false, message }
  if (data?.success === false) {
    return {
      success: false,
      message: data?.message || "Não foi possível carregar os dados do usuário.",
    };
  }

  // Aceita variações comuns do payload:
  // 1. { user: {...} }
  // 2. { account: {...} }
  // 3. { data: { user: {...} } }
  // 4. { data: { account: {...} } }
  // 5. { data: {...} } onde data é o próprio usuário
  // 6. Objeto direto com campos do usuário (id, fullName, role, etc.)
  
  let resolvedUser: User | null = null;

  if (data?.user && typeof data.user === "object" && data.user.id) {
    resolvedUser = data.user;
  } else if (data?.account && typeof data.account === "object" && data.account.id) {
    resolvedUser = data.account;
  } else if (data?.data?.user && typeof data.data.user === "object" && data.data.user.id) {
    resolvedUser = data.data.user;
  } else if (data?.data?.account && typeof data.data.account === "object" && data.data.account.id) {
    resolvedUser = data.data.account;
  } else if (data?.data && typeof data.data === "object" && data.data.id) {
    resolvedUser = data.data;
  } else if (data && typeof data === "object" && data.id && (data.fullName || data.username || data.email || data.role)) {
    // Objeto direto sem wrapper (ex: { id, fullName, role, ... })
    resolvedUser = data as User;
  }

  if (!resolvedUser) {
    // Log para debug em DEV
    if (import.meta.env.DEV) {
      console.warn("[getMe] Payload inesperado:", JSON.stringify(data, null, 2));
    }
    return {
      success: false,
      message: "Resposta inválida do servidor: dados do usuário não encontrados.",
    };
  }

  return { success: true, account: resolvedUser };
}

export async function forgotPassword(email: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return handleApiResponse(response);
}

export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  return handleApiResponse(response);
}

// ==================== DELIVERIES ====================

export interface Delivery {
  id: number;
  trackingCode: string;
  recipientName: string;
  block?: string;
  apartmentNumber: string;
  status: string;
  arrivalDate: string;
  withdrawalDate?: string | null;
  doorman?: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

interface DeliveriesResponse {
  success: boolean;
  deliveries: Delivery[];
}

export async function getDeliveries(token: string): Promise<DeliveriesResponse> {
  const response = await fetch(`${API_BASE_URL}/deliveries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, deliveries: [] };
  }
  // Accept: { deliveries: [...] }, { data: [...] }, or direct array [...]
  const deliveries = data?.deliveries || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, deliveries };
}

// Doorman-specific deliveries route
export async function getDoormanDeliveries(token: string): Promise<DeliveriesResponse> {
  const response = await fetch(`${API_BASE_URL}/doorman/deliveries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, deliveries: [] };
  }
  const deliveries = data?.deliveries || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, deliveries };
}

// Syndic-specific deliveries route
export async function getSyndicDeliveries(token: string): Promise<DeliveriesResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/deliveries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, deliveries: [] };
  }
  const deliveries = data?.deliveries || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, deliveries };
}

// Doorman: get delivery by tracking code
export async function getDoormanDeliveryByCode(token: string, trackingCode: string): Promise<ApiResponse<Delivery>> {
  const response = await fetch(`${API_BASE_URL}/doorman/deliveries/${trackingCode}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: data?.detail || data?.message || "Entrega não encontrada" };
  }
  // Accept delivery directly or wrapped
  const delivery = data?.delivery || data?.data || data;
  return { success: true, account: delivery };
}

// Doorman: confirm delivery using PUT
export async function confirmDoormanDelivery(token: string, trackingCode: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/doorman/deliveries/${trackingCode}/confirm`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

// ==================== DOORMAN ====================

interface RegisterDeliveryPayload {
  recipientName: string;
  block: string;
  apartmentNumber: string;
}

export async function registerDelivery(token: string, data: RegisterDeliveryPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/doorman/deliveries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
}

export async function getDeliveryByCode(token: string, trackingCode: string): Promise<ApiResponse<Delivery>> {
  const response = await fetch(`${API_BASE_URL}/deliveries/${trackingCode}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse<Delivery>(response);
}

export async function confirmDelivery(token: string, trackingCode: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/doorman/deliveries/${trackingCode}/confirm`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

// ==================== SYNDIC ====================

export interface Account {
  id: number;
  fullName: string;
  username: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: string;
  accountStatus?: string;
  block?: string;
  apartmentNumber?: string;
  bannedAt?: string;
  banExpiresAt?: string;
  [key: string]: unknown;
}

interface AccountsResponse {
  success: boolean;
  accounts: Account[];
}

interface AccountResponse {
  success: boolean;
  account: Account;
}

export async function getAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  // Accept: { accounts: [...] }, { data: [...] }, or direct array [...]
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

export async function getAccountById(token: string, accountId: number): Promise<AccountResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/${accountId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleApiResponse<{ account: Account }>(response);
  return { success: result.success, account: (result as any).account };
}

export async function deleteAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/${accountId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function getPendingAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/pendants`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

export async function approveAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/approve/${accountId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function changeAccountRole(token: string, id: number, role: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, role }),
  });

  return handleApiResponse(response);
}

type BanUnit = "Hours" | "Days" | "Weeks" | "Months" | "Years";

export async function banAccount(token: string, id: number, duration: number, unit: BanUnit): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/ban`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, duration, unit }),
  });

  return handleApiResponse(response);
}

export async function unbanAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/unban/${accountId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function getBannedAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/accounts/bans`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

// ==================== PLANS & SUBSCRIPTIONS ====================

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

interface PlansResponse {
  success: boolean;
  plans: Plan[];
}

interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  message?: string;
}

export async function getPlans(): Promise<PlansResponse> {
  const response = await fetch(`${API_BASE_URL}/plan`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await handleApiResponse<{ plans: Plan[] }>(response);
  return { success: result.success, plans: (result as any).plans || [] };
}

export async function createCheckout(subscriptionPlan: string, token: string): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/plan/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subscriptionPlan }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: data?.detail || data?.message || "Erro ao iniciar checkout" };
  }
  return { 
    success: true, 
    checkoutUrl: data?.url || data?.checkoutUrl,
    message: data?.message 
  };
}

export async function cancelSubscription(token: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/plan/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

// ==================== CONDOMINIUM ====================

export interface CondominiumSignUpPayload {
  name: string;
  cnpj: string;
  businessEmail: string;
  businessPhone: string;
  blocksCount: number;
  apartmentCount: number;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export async function registerCondominium(token: string, data: CondominiumSignUpPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/condominium/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse(response);
}

// ==================== ADMIN (BUSINESS) ====================

export interface Condominium {
  id: number;
  name: string;
  code: string;
  address?: string;
  totalUnits?: number;
  totalResidents?: number;
  createdAt?: string;
  status?: string;
  [key: string]: unknown;
}

interface CondominiumsResponse {
  success: boolean;
  condominiums: Condominium[];
}

interface AdminStatsResponse {
  success: boolean;
  stats?: {
    totalCondominiums: number;
    totalUsers: number;
    activeDeliveries: number;
    pendingApprovals: number;
  };
}

export async function getAdminCondominiums(token: string): Promise<CondominiumsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/condominiums`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, condominiums: [] };
  }
  const condominiums = data?.condominiums || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, condominiums };
}

export async function getAdminStats(token: string): Promise<AdminStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false };
  }
  return { success: true, stats: data?.stats || data };
}

export async function getAdminAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

export async function getAdminPendingAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/pendants`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

export async function getAdminBannedAccounts(token: string): Promise<AccountsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/bans`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, accounts: [] };
  }
  const accounts = data?.accounts || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, accounts };
}

export async function getAdminDeliveries(token: string): Promise<DeliveriesResponse> {
  const response = await fetch(`${API_BASE_URL}/syndic/deliveries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, deliveries: [] };
  }
  const deliveries = data?.deliveries || data?.data || (Array.isArray(data) ? data : []);
  return { success: true, deliveries };
}

export async function adminApproveAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/approve/${accountId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function adminDeleteAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/${accountId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function adminBanAccount(token: string, id: number, duration: number, unit: BanUnit): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/ban`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, duration, unit }),
  });

  return handleApiResponse(response);
}

export async function adminUnbanAccount(token: string, accountId: number): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/unban/${accountId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

export async function adminChangeAccountRole(token: string, accountId: number, role: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: accountId, role }),
  });

  return handleApiResponse(response);
}

// Type export for BanUnit
export type { BanUnit };

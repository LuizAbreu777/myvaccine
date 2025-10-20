export interface User {
  cpf: string;
  name: string;
  email: string;
  role: 'admin' | 'usuario';
  dob: string;
  address: string;
  telephone: string;
}

export interface Vaccine {
  id: number;
  name: string;
  min_age: number;
  max_age?: number;
  contraindications?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
  stocks?: Stock[];
}

export interface Stock {
  id: number;
  post_id: number;
  vaccine_id: number;
  quantity: number;
  batch: string;
  expiration_date: string;
  created_at: string;
  updated_at: string;
  vaccine?: Vaccine;
  post?: Post;
}

export interface VaccinationHistory {
  id: number;
  user_cpf: string;
  vaccine_id: number;
  post_id: number;
  batch: string;
  application_date: string;
  created_at: string;
  updated_at: string;
  user?: User;
  vaccine?: Vaccine;
  post?: Post;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  cpf: string;
  name: string;
  email: string;
  password: string;
  dob: string;
  address: string;
  telephone: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export enum StockMovementType {
  ENTRY = 'entrada',
  EXIT = 'saida',
  ADJUSTMENT = 'ajuste',
  EXPIRED = 'vencido',
  TRANSFER = 'transferencia'
}

export interface StockHistory {
  id: number;
  post_id: number;
  vaccine_id: number;
  user_id?: number;
  movement_type: StockMovementType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  batch?: string;
  expiration_date?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  post?: Post;
  vaccine?: Vaccine;
  user?: User;
}

export interface StockHistoryStats {
  totalEntries: number;
  totalExits: number;
  totalAdjustments: number;
  totalExpired: number;
  totalTransfers: number;
}

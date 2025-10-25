import api from "./api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Vaccine,
  Post,
  Stock,
  VaccinationHistory,
  StockHistory,
  StockHistoryStats,
  StockMovementType,
} from "../types";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🌐 Fazendo requisição para API:', credentials);
    const response = await api.post("/auth/login", credentials);
    console.log('📡 Resposta da API:', response.data);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export const vaccineService = {
  async getAll(): Promise<Vaccine[]> {
    const response = await api.get("/vaccines");
    return response.data;
  },

  async getById(id: number): Promise<Vaccine> {
    const response = await api.get(`/vaccines/${id}`);
    return response.data;
  },

  async create(
    vaccine: Omit<Vaccine, "id" | "created_at" | "updated_at">
  ): Promise<Vaccine> {
    const response = await api.post("/vaccines", vaccine);
    return response.data;
  },

  async update(id: number, vaccine: Partial<Vaccine>): Promise<Vaccine> {
    const response = await api.patch(`/vaccines/${id}`, vaccine);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/vaccines/${id}`);
  },
};

export const postService = {
  async getAll(): Promise<Post[]> {
    const response = await api.get("/posts");
    return response.data;
  },

  async getById(id: number): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async create(
    post: Omit<Post, "id" | "created_at" | "updated_at">
  ): Promise<Post> {
    const response = await api.post("/posts", post);
    return response.data;
  },

  async update(id: number, post: Partial<Post>): Promise<Post> {
    const response = await api.patch(`/posts/${id}`, post);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async toggleStatus(id: number): Promise<Post> {
    const response = await api.patch(`/posts/${id}/toggle-status`);
    return response.data;
  },
};

export const stockService = {
  async getByPost(postId: number): Promise<Stock[]> {
    const response = await api.get(`/stocks/post/${postId}`);
    return response.data;
  },

  async getAll(): Promise<Stock[]> {
    const response = await api.get("/stocks");
    return response.data;
  },

  async create(
    stock: Omit<Stock, "id" | "created_at" | "updated_at">
  ): Promise<Stock> {
    const response = await api.post("/stocks", stock);
    return response.data;
  },

  async update(id: number, stock: Partial<Stock>): Promise<Stock> {
    const response = await api.patch(`/stocks/${id}`, stock);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/stocks/${id}`);
  },
};

export const vaccinationHistoryService = {
  async getAll(): Promise<VaccinationHistory[]> {
    const response = await api.get("/vaccination-history");
    return response.data;
  },

  async getByUser(cpf: string): Promise<VaccinationHistory[]> {
    const response = await api.get(`/vaccination-history/user/${cpf}`);
    return response.data;
  },

  async create(
    history: Omit<VaccinationHistory, "id" | "created_at" | "updated_at">
  ): Promise<VaccinationHistory> {
    const response = await api.post("/vaccination-history", history);
    return response.data;
  },

  async update(id: number, history: Partial<VaccinationHistory>): Promise<VaccinationHistory> {
    const response = await api.patch(`/vaccination-history/${id}`, history);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/vaccination-history/${id}`);
  },
};

export const stockHistoryService = {
  async getAll(): Promise<StockHistory[]> {
    const response = await api.get("/stock-history");
    return response.data;
  },

  async getRecent(limit?: number): Promise<StockHistory[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/stock-history/recent${params}`);
    return response.data;
  },

  async getStats(): Promise<StockHistoryStats> {
    const response = await api.get("/stock-history/stats");
    return response.data;
  },

  async getByPost(postId: number): Promise<StockHistory[]> {
    const response = await api.get(`/stock-history/post/${postId}`);
    return response.data;
  },

  async getByVaccine(vaccineId: number): Promise<StockHistory[]> {
    const response = await api.get(`/stock-history/vaccine/${vaccineId}`);
    return response.data;
  },

  async getByMovementType(movementType: StockMovementType): Promise<StockHistory[]> {
    const response = await api.get(`/stock-history/movement/${movementType}`);
    return response.data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<StockHistory[]> {
    const response = await api.get(`/stock-history/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

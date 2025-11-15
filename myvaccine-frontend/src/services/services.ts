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
  Dependent,
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
    // Normalizar CPF (remover pontos e traços) antes de enviar
    const normalizedCpf = cpf.replace(/[.-]/g, '');
    const response = await api.get(`/vaccination-history/user/${normalizedCpf}`);
    return response.data;
  },

  async getByUserDependents(cpf: string): Promise<VaccinationHistory[]> {
    // Normalizar CPF (remover pontos e traços) antes de enviar
    const normalizedCpf = cpf.replace(/[.-]/g, '');
    const response = await api.get(`/vaccination-history/user/${normalizedCpf}/dependents`);
    return response.data;
  },

  async getByUserAll(cpf: string): Promise<VaccinationHistory[]> {
    // Normalizar CPF (remover pontos e traços) antes de enviar
    const normalizedCpf = cpf.replace(/[.-]/g, '');
    const response = await api.get(`/vaccination-history/user/${normalizedCpf}/all`);
    return response.data;
  },

  async create(
    history: Omit<VaccinationHistory, "id" | "created_at" | "updated_at" | "is_dependent">
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

export const dependentService = {
  async getAll(): Promise<Dependent[]> {
    const response = await api.get("/dependents");
    return response.data;
  },

  async getByCpf(cpf: string): Promise<Dependent> {
    const response = await api.get(`/dependents/${cpf}`);
    return response.data;
  },

  async checkCpf(cpf: string): Promise<{ isDependent: boolean; name?: string; relationship?: string }> {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return { isDependent: false };
    }
    try {
      const response = await api.get(`/dependents/check/${cleanCpf}`);
      return response.data;
    } catch (error) {
      return { isDependent: false };
    }
  },

  async create(
    dependent: Omit<Dependent, "created_at" | "updated_at" | "user_cpf">
  ): Promise<Dependent> {
    const response = await api.post("/dependents", dependent);
    return response.data;
  },

  async update(
    cpf: string,
    dependent: Partial<Omit<Dependent, "cpf" | "created_at" | "updated_at" | "user_cpf">>
  ): Promise<Dependent> {
    const response = await api.put(`/dependents/${cpf}`, dependent);
    return response.data;
  },

  async delete(cpf: string): Promise<void> {
    await api.delete(`/dependents/${cpf}`);
  },
};

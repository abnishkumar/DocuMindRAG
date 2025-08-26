export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
    email: string;
    phone?: string;
    password: string;
    full_name?: string;
    role_id?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  payload?: {
    sub: string;
    username: string;
    roleId: string;
  };
}

export interface User {
  sub: string;
  username: string;
  roleId: string;
}
export interface LoginDto {
  username: string;
  password?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    role: string;
  };
}

export interface RefreshDto {
  refreshToken: string;
}

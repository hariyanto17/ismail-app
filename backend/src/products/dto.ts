export interface CreateProductDto {
  category_id: string;
  name: string;
  price: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface UpdateProductDto {
  category_id?: string;
  name?: string;
  price?: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface ProductResponseDto {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  price: number;
  is_active: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

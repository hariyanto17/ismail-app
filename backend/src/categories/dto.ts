export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// src/api/assetsApi.ts

import { http } from "./http";

export type AssetStatus = "available" | "in_use" | "maintenance";

export interface AssetDto {
  id: string;
  name: string;
  inventoryCode: string;
  status: AssetStatus;
}

export interface AssetsResponseDto {
  items: AssetDto[];
  page: number;
  total: number;
}

export async function fetchAssets(page = 1): Promise<AssetsResponseDto> {
  try {
    const items = await assetService.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    return {
      items: safeItems.map(assetToDto),
      page,
      total: safeItems.length,
    };
  } catch (error) {
    console.error("Ошибка загрузки активов:", error);
    return { items: [], page: 1, total: 0 };
  }
}

export async function createAsset(asset: Omit<AssetDto, "id">): Promise<AssetDto> {
  const { data } = await http.post<AssetDto>("/assets", asset);
  return data;
}

export async function updateAsset(id: string, asset: Partial<AssetDto>): Promise<AssetDto> {
  const { data } = await http.put<AssetDto>(`/assets/${id}`, asset);
  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  await http.delete(`/assets/${id}`);
}
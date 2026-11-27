import api from "@/lib/axios";

export interface AiFeatureTypeItem {
  _id?: string;
  aiFeatureTypeId: string;
  name: string;
  description: string;
  current_model: string;
  current_provider: string;
  icon: string;
  color: string;
}

export interface AiProviderItem {
  _id?: string;
  providerId: string;
  name: string;
  models: string[];
}

export interface AiTokenItem {
  _id?: string;
  provider: string;
  hasKey: boolean;
  maskedKey: string;
  maxTokens: number;
  defaultModel: string;
  isActive: boolean;
  customEndpoint?: string;
}

export interface AiSettingsData {
  features: AiFeatureTypeItem[];
  providers: AiProviderItem[];
  tokens: AiTokenItem[];
}

export async function fetchAiSettingsApi(): Promise<AiSettingsData> {
  const res = await api.get("/admin/ai-settings");
  return res.data?.data || { features: [], providers: [], tokens: [] };
}

export async function updateAiFeatureRouteApi(
  id: string,
  modelName: string,
  providerName: string
): Promise<AiFeatureTypeItem> {
  const res = await api.put(`/admin/ai-settings/features/${id}`, {
    current_model: modelName,
    current_provider: providerName,
  });
  return res.data?.data;
}

export async function registerAiModelApi(payload: {
  modelName: string;
  provider: string;
  targetFeatureType?: string;
}): Promise<any> {
  const res = await api.post("/admin/ai-settings/models", payload);
  return res.data?.data;
}

export async function saveAiTokenSettingApi(payload: {
  provider: string;
  apiKey?: string;
  maxTokens?: number;
  defaultModel?: string;
  isActive?: boolean;
  customEndpoint?: string;
}): Promise<AiTokenItem> {
  const res = await api.post("/admin/ai-settings/tokens", payload);
  return res.data?.data;
}

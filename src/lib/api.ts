export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
};

export interface EnhanceImageRequest {
  image: string;
  mode: string;
  intensity: string;
}

export interface EnhanceImageResponse {
  enhancedImage?: string;
  mode?: string;
  message?: string;
  analysis?: string;
  error?: string;
}

export interface TranslateTextRequest {
  texts: string[];
  targetLanguage: string;
}

export interface TranslateTextResponse {
  translations?: string[];
  message?: string;
  error?: string;
}

export interface TranslateImageRequest {
  image: string;
  targetLanguage: string;
  translatedTexts?: Array<{ original: string; translated: string }>;
  correctedTexts?: string[];
  quality?: "standard" | "premium" | "ultra";
  fontMatching?: "auto" | "preserve" | "native";
  textStyle?: "exact" | "natural" | "adaptive";
  preserveFormatting?: boolean;
  enhanceReadability?: boolean;
}

export interface TranslateImageResponse {
  translatedImage?: string;
  targetLanguage?: string;
  message?: string;
  analysis?: string;
  error?: string;
}

export interface DetectTextRequest {
  image: string;
  model?: string; // Optional: specify model to use
}

export interface DetectedTextItem {
  id: string;
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DetectTextResponse {
  detectedTexts?: DetectedTextItem[];
  message?: string;
  error?: string;
}

export const enhanceImage = async (request: EnhanceImageRequest): Promise<EnhanceImageResponse> => {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/api/enhance-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to process image. Error: ${response.status}`);
  }

  return await response.json();
};

export const translateImage = async (request: TranslateImageRequest): Promise<TranslateImageResponse> => {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/api/translate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to translate image. Error: ${response.status}`);
  }

  return await response.json();
};

export const detectText = async (request: DetectTextRequest): Promise<DetectTextResponse> => {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/api/detect-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to detect text. Error: ${response.status}`);
  }

  return await response.json();
};

export const translateText = async (request: TranslateTextRequest): Promise<TranslateTextResponse> => {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/api/translate-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to translate text. Error: ${response.status}`);
  }

  return await response.json();
};


export interface CartoonGeneration {
  id: string;
  title: string;
  actual_title?: string;
  description?: string;
  image_url: string;
  created_at: string;
}

export interface Prompt {
  id?: number;
  name: string;
  content: string;
  created_at?: string;
}
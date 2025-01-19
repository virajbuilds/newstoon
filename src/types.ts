export interface CartoonGeneration {
  id?: number;
  input_text: string;
  story_prompt: string;
  image_url: string;
  title: string;
  actual_title?: string;
  is_daily: boolean;
  created_at?: string;
  user_id?: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface Prompt {
  id?: number;
  name: string;
  content: string;
  created_at?: string;
}
export type ToolType = 'pencil' | 'eraser' | 'bucket' | 'picker';

export type StampType = 'sun' | 'mountain' | 'cat' | 'coffee' | 'botanical' | 'star' | 'cloud' | 'heart' | 'lighthouse';

export interface Postcard {
  id: string;
  title: string;
  pixels: string[]; // 1024 hex strings (32x32)
  sender: string;
  location: string;
  message: string;
  stampType: StampType;
  stampColor: string;
  createdAt: number;
  isUserSent?: boolean;
  isUserReceived?: boolean;
  isFromPreviousStranger?: boolean;
  sourceLabel?: string;
  likes?: number;
  hasLiked?: boolean;
}

export interface Palette {
  name: string;
  colors: string[];
}

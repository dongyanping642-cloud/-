
export enum DebateMode {
  HUMAN_VS_AI = 'HUMAN_VS_AI',
  AI_VS_AI = 'AI_VS_AI'
}

export enum Side {
  PRO = 'PRO', // 正方
  CON = 'CON'  // 反方
}

export interface Debater {
  id: string;
  name: string;
  avatar: string;
  style: string;
  persona: string;
}

export interface Message {
  senderId: string;
  senderName: string;
  side: Side;
  content: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  mode: DebateMode;
  topic: string;
  totalRounds: number;
  currentRound: number;
  messages: Message[];
  proDebater: Debater | 'User';
  conDebater: Debater | 'User';
  proScore: number;
  conScore: number;
  isFinished: boolean;
  userSide?: Side;
}

export interface CoachAdvice {
  analysis: string;
  counterPoints: string[];
  goldenQuotes: string[];
  analogy: string;
}

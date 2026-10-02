export type KycStatus = "none" | "pending" | "tentative" | "passed" | "rejected";

export type TaskStatus =
  | "open"
  | "assigned"
  | "submitted"
  | "completed"
  | "disputed"
  | "cancelled";

export type TaskCategory =
  | "ai_data"
  | "local_service"
  | "micro_freelance"
  | "survey"
  | "content"
  | "other";

export interface Pioneer {
  uid: string;
  username: string;
  walletAddress?: string;
  kycStatus: KycStatus;
  reputationScore: number;
  completedTasks: number;
  totalEarned: number;
  skills: string[];
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardPi: number;
  posterUid: string;
  posterUsername: string;
  assigneeUid?: string;
  assigneeUsername?: string;
  status: TaskStatus;
  requirements: string[];
  deadline?: string;
  location?: string; // for local services
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  escrowTxId?: string;
  completionProof?: string;
  rating?: number;
}

export interface PaymentPayload {
  amount: number;
  memo: string;
  metadata: {
    taskId: string;
    type: "escrow" | "release" | "refund" | "platform_fee";
  };
}

export interface ReputationEvent {
  id: string;
  fromUid: string;
  toUid: string;
  taskId: string;
  score: number; // 1-5
  comment?: string;
  createdAt: string;
}

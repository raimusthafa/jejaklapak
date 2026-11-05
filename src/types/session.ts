import { SellingStatus } from "./merchant";

export interface SellingSession {
  id: string;
  merchantId: string;
  status: SellingStatus;
  startedAt: string;
  pausedAt?: string;
  endedAt?: string;
  notes?: string;
}


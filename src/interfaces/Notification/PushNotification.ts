export interface PushNotification {
  id: string;
  type: number;
  message: string;
  creatorId: string;
  creatorDisplayName: string;
  customMessage: string;
  createdAt: Date;
}

import { User } from '@/features/auth/lib/auth';

export interface CallMember {

  user: User;
  stream?: MediaStream | null;
  isSelf: boolean;
  joined: boolean;
}
export interface CallRoom {
  id: string;
  sender: User;
  memberIds: string[];

  acceptedUserIds: string[];
  rejectedUserIds: string[];
  joinedUserIds: string[];

  createdAt: number;
  started: boolean;

}
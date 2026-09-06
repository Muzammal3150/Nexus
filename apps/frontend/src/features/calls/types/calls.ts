import { User } from '@/features/auth/lib/auth';

export interface CallMember {

  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  stream?: MediaStream | null;
  isSelf: boolean;
  isJoined: boolean;
}
export interface CallRoom {
  id: string;
  sender: User;
  members: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    isJoined: boolean;
  }[];

  createdAt: number;
  started: boolean;

}
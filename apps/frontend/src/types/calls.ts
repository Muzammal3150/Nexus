import { User } from "better-auth";

export interface CallMember {
  user: User;

  stream?: MediaStream;

  state: {
    camera: boolean;
    mic: boolean;
  };

  isSelf: boolean;
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
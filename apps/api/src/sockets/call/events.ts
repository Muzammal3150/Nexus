export const CallEvents = {
    Init: "call:init",
    Invite: "call:invite",
    Accept: "call:accept",
    Reject: "call:reject",

    Offer: "call:offer",
    Answer: "call:answer",
    IceCandidate: "call:ice-candidate",
    GetRoom: "call:get-room",

    Leave: "call:leave",

    LeaveBroadcast: "call:leave-broadcast",
    InviteBroadcast: "call:invite-broadcast",
    AcceptBroadcast: "call:accept-broadcast",
    JoinBroadcast: "call:join-broadcast",
    RejectBroadcast: "call:reject-broadcast",
    ReadyBroadcast: "call:ready-broadcast",
    ExpiredBroadcast: "call:expired-broadcast",

    Error: "call:error"
} as const;
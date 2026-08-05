export const CallEvents = {
    Init: "call:init",
    Leave: "call:leave",
    GetRoom: "call:get-room",
    Ready: "call:ready",

    Invite: "call:invite",
    Accept: "call:accept",
    Reject: "call:reject",


    Offer: "rtc:offer",
    Answer: "rtc:answer",
    IceCandidate: "rtc:ice-candidate",


    IceCandidateBroadcast: "rtc:ice-candidate-broadcast",
    LeaveBroadcast: "call:leave-broadcast",
    InviteBroadcast: "call:invite-broadcast",
    AcceptBroadcast: "call:accept-broadcast",
    JoinBroadcast: "call:join-broadcast",
    RejectBroadcast: "call:reject-broadcast",
    ReadyBroadcast: "call:ready-broadcast",
    ExpiredBroadcast: "call:expired-broadcast",
    OfferBroadcast: "rtc:offer-broadcast",

    AnswerBroadcast: "rtc:answer-broadcast",
    Error: "call:error"
} as const;
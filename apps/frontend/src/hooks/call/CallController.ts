import { callSocket } from "@/lib/socket";
import { User } from "better-auth";

export class CallController {
    readonly id = crypto.randomUUID();
    isInit = false
    roomId: string

    peers = new Map<string, RTCPeerConnection>();
    myStream: MediaStream | null = null


    constructor(roomId: string) {
        this.roomId = roomId
    }


    init() {
        if (this.isInit) return;
        this.isInit = true;
        console.log("init", this.id)
        callSocket.off("call:accept-broadcast", this.handleAccept);
        callSocket.off("rtc:offer-broadcast", this.handleOffer);
        callSocket.off("rtc:answer-broadcast", this.handleAnswer);

        callSocket.on("call:accept-broadcast", this.handleAccept);
        callSocket.on("rtc:offer-broadcast", this.handleOffer);
        callSocket.on("rtc:answer-broadcast", this.handleAnswer);
    }

    destroy() {
        if (!this.isInit) return;
        this.isInit = false;

        console.log("destroy", this.id)
        callSocket.off("call:accept-broadcast", this.handleAccept);
        callSocket.off("rtc:offer-broadcast", this.handleOffer);
        callSocket.off("rtc:answer-broadcast", this.handleAnswer);

        for (const peer of this.peers.values()) {
            peer.close();
        }

        this.peers.clear();

        // this.myStream?.getTracks().forEach(track => track.stop());
        // this.myStream = null;

    }

    handleAccept = async ({ user }: { user: User }) => {

        const peer = this.createPeer(user.id)
        console.count("handleAccept");
        console.trace();

        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        console.log("handle-accept", offer)

        callSocket.emit("rtc:offer", {
            targetId: user.id,
            offer: offer,
            roomId: this.roomId,
        })
    }

    handleOffer = async ({ roomId, sender, offer, }: { sender: User; roomId: string; offer: RTCSessionDescriptionInit; }) => {
        const peer = this.createPeer(sender.id)
        console.log("handle-offer", offer)
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        callSocket.emit("rtc:answer", {
            targetId: sender.id,
            roomId,
            answer,
        });

    }

    handleAnswer = async ({ sender, answer }: { sender: User, answer: RTCSessionDescriptionInit }) => {
        console.log("handle-answer", answer)

        const peer = this.peers.get(sender.id)
        if (!peer) return;

        await peer.setRemoteDescription(
            new RTCSessionDescription(answer)
        );
    }




    private createPeer(userId: string) {
        console.log("creating peer")
        // // if (this.myStream == null) return;
        // const existing = this.peers.get(userId);

        // if (existing) {
        //     return existing;
        // }

        const peer = new RTCPeerConnection();

        // if (this.myStream) this.myStream.getTracks().forEach(track => {
        //     peer.addTrack(track, this.myStream!);
        // });

        this.peers.set(userId, peer);

        return peer;
    }
}


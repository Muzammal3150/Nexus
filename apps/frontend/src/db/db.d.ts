// db/types/message.ts

export type CachedMessage = | CachedTextMessage | CachedFileMessage;


export interface BaseMessage {
    id: string;
    roomId: string;
    senderId: string;
    sentAt: number;
    isRead: boolean;
}


export interface CachedTextMessage extends BaseMessage {
    type: "text";
    text: string;
}


export interface CachedFileMessage extends BaseMessage {
    type: "file";
    attachment: CachedFileData
}


export interface CachedFileData {
    fileId: string;

    // Server metadata
    filename?: string;
    originalFilename: string;

    mimeType: string;
    size: number;

    // Preview
    thumbnail?: Blob;

    // Transfer state
    status: FileTransferStatus;

    uploadProgress: number;
    downloadProgress: number;

    error?: string;
}


export interface CachedFile {
    id: string;
    file: File;

}



export type FileTransferStatus =
    | "pending"
    | "uploading"
    | "uploaded"
    | "downloading"
    | "downloaded"
    | "failed";




export interface CachedContact {
    userId: string;
    name: string;
    createdAt: number;
}
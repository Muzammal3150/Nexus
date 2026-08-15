export const UiState = {
    Call: {
        NewCallDialog: 'new-call-dialog',
    },
    Chat: {
        NewChatDialog: "new-chat-dialog",
        GroupInfo: {
            AddMemberDialog: 'group-info-add-member-dialog',
            MembersDialog: 'group-info-members-dialog',
            Drawer: 'group-info-drawer',
            EditHeaderDialog: 'group-info-edit-header-dialog'
        },

    },
    Contact: {
        NewContactDialog: "new-contact-dialog"
    }
} as const;
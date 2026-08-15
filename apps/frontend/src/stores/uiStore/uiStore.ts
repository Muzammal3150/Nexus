import { create } from "zustand";

type UiStore = {
    states: Record<string, boolean>;

    isOpen: (id: string) => boolean;
    setOpen: (id: string, isOpen: boolean) => void;
    open: (id: string) => void;
    close: (id: string) => void;
    toggle: (id: string) => void;
};

export const useUiStore = create<UiStore>((set, get) => ({
    states: {},

    isOpen: (id) => get().states[id] ?? false,

    setOpen: (id, isOpen) =>set((state) => ({
            states: {
                ...state.states,
                [id]: isOpen,
            },
        })),

    open: (id) => get().setOpen(id, true),
    close: (id) => get().setOpen(id, false),
    toggle: (id) => get().setOpen(id, !get().isOpen(id)),
}));




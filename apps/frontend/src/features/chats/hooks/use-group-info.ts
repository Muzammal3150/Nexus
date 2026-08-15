import { Contact } from "@/features/contacts/stores/contact-store";
import { Member } from "better-auth/plugins";
import { useMemo, useRef, useState } from "react";
import { initialGroup, initialMembers, CURRENT_USER_ID, PREVIEW_COUNT, allContacts } from "../components/room-info/data";


export function useGroupInfo() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const [group, setGroup] = useState<GroupInfo>(initialGroup);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [muted, setMuted] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allMembersOpen, setAllMembersOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clearChatOpen, setClearChatOpen] = useState(false);
  const [left, setLeft] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = (msg: string) => {
    setBanner(msg);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 2400);
  };

  const currentMember = members.find((m) => m.id === CURRENT_USER_ID);
  const isAdmin = currentMember?.role === "admin";

  const adminCount = useMemo(
    () => members.filter((m) => m.role === "admin").length,
    [members]
  );

  // --- Members search (quick preview list inside the drawer) --------------
  const [memberQuery, setMemberQuery] = useState("");

  const filteredPreviewMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    const list = q
      ? members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.handle.toLowerCase().includes(q)
        )
      : members;
    return list.slice(0, PREVIEW_COUNT);
  }, [members, memberQuery]);

  const hasMoreMembers = members.length > PREVIEW_COUNT || memberQuery.trim().length > 0;

  // --- Edit group -----------------------------------------------------
  const [draftName, setDraftName] = useState(group.name);
  const [draftDesc, setDraftDesc] = useState(group.description);

  const openEdit = () => {
    setDraftName(group.name);
    setDraftDesc(group.description);
    setEditOpen(true);
  };

  const saveEdit = () => {
    const name = draftName.trim();
    if (!name) return;
    setGroup((g) => ({ ...g, name, description: draftDesc.trim() }));
    setEditOpen(false);
    showBanner("Group info updated");
  };

  // --- Add members ------------------------------------------------------
  const [contactSearch, setContactSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const memberHandles = useMemo(
    () => new Set(members.map((m) => m.handle)),
    [members]
  );

  const filteredContacts = useMemo(
    () =>
      allContacts
        .filter((c) => !memberHandles.has(c.handle))
        .filter(
          (c) =>
            c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
            c.handle.toLowerCase().includes(contactSearch.toLowerCase())
        ),
    [contactSearch, memberHandles]
  );

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetAddMemberState = () => {
    setContactSearch("");
    setSelected(new Set());
  };

  const confirmAddMembers = () => {
    const toAdd: Contact[] = allContacts.filter((c) => selected.has(c.id));
    const newMembers: Member[] = toAdd.map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatarUrl: c.avatarUrl,
      role: "member",
      online: false,
    }));
    setMembers((prev) => [...prev, ...newMembers]);
    showBanner(
      `${newMembers.length} member${newMembers.length === 1 ? "" : "s"} added`
    );
    resetAddMemberState();
    setAddMemberOpen(false);
  };

  // --- Remove member ------------------------------------------------------
  const confirmRemoveMember = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    showBanner(`${removeTarget.name} removed from group`);
    setRemoveTarget(null);
  };

  // --- Role toggle (admin/member) ------------------------------------------
  const toggleRole = (member: Member) => {
    if (member.role === "admin" && adminCount === 1) {
      showBanner("Group needs at least one admin");
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? { ...m, role: m.role === "admin" ? "member" : "admin" }
          : m
      )
    );
    showBanner(
      `${member.name} is now ${member.role === "admin" ? "a member" : "an admin"}`
    );
  };

  // --- Leave group ------------------------------------------------------
  const confirmLeave = () => {
    setLeaveOpen(false);
    setDrawerOpen(false);
    setLeft(true);
  };

  // --- Delete group ------------------------------------------------------
  const confirmDelete = () => {
    setDeleteOpen(false);
    setDrawerOpen(false);
    setDeleted(true);
  };

  // --- Clear chat ------------------------------------------------------
  const confirmClearChat = () => {
    setClearChatOpen(false);
    showBanner("Chat history cleared");
  };

  return {
    // core state
    group,
    members,
    muted,
    setMuted,
    isAdmin,
    currentUserId: CURRENT_USER_ID,
    banner,

    // drawer / dialog open state
    drawerOpen,
    setDrawerOpen,
    editOpen,
    setEditOpen,
    addMemberOpen,
    setAddMemberOpen: (open: boolean) => {
      setAddMemberOpen(open);
      if (!open) resetAddMemberState();
    },
    allMembersOpen,
    setAllMembersOpen,
    removeTarget,
    setRemoveTarget,
    leaveOpen,
    setLeaveOpen,
    deleteOpen,
    setDeleteOpen,
    clearChatOpen,
    setClearChatOpen,
    left,
    deleted,

    // members preview + search
    memberQuery,
    setMemberQuery,
    filteredPreviewMembers,
    hasMoreMembers,

    // edit group
    draftName,
    setDraftName,
    draftDesc,
    setDraftDesc,
    openEdit,
    saveEdit,

    // add members
    contactSearch,
    setContactSearch,
    selected,
    toggleSelected,
    filteredContacts,
    confirmAddMembers,

    // member actions
    confirmRemoveMember,
    toggleRole,

    // destructive group actions
    confirmLeave,
    confirmDelete,
    confirmClearChat,

    // opens "add members" from within the all-members dialog
    openAddFromAllMembers: () => {
      setAllMembersOpen(false);
      setAddMemberOpen(true);
    },
  };
}

export type UseGroupInfoReturn = ReturnType<typeof useGroupInfo>;

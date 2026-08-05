useEffect(() => {
    function handleJoin({ user }: { user: User }) {
        setMembers(prev => prev.map(member => member.user.id === user.id ? {
            ...member,
            joined: true,
        } : member))
    }

    function handleLeave({ user }: { user: User }) {
        setMembers(prev => prev.filter(member => member.user.id != user.id));
    }

    callSocket.on("call:join-broadcast", handleJoin);
    callSocket.on("call:leave-broadcast", handleLeave);
    callSocket.on("call:reject-broadcast", handleLeave);
    return () => {
        callSocket.off("call:join-broadcast", handleJoin);
        callSocket.off("call:leave-broadcast", handleLeave);
        callSocket.off("call:reject-broadcast", handleLeave);

    };
}, []);
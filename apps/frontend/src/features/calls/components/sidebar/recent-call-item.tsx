// "use client";

// import { ArrowDownLeft, ArrowUpRight, Phone, Video } from "lucide-react";

// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { getInitials } from "@/features/chats/lib/utils-chat";
// import { cn } from "@/lib/utils";
// // import { RecentCall } from "@/types/contacts";

// function DirectionIcon({ call }: { call: RecentCall }) {
//   const isMissed = call.direction === "missed";
//   const Icon = call.direction === "outgoing" ? ArrowUpRight : ArrowDownLeft;
//   return (
//     <Icon
//       className={cn("size-3.5", isMissed ? "text-destructive" : "text-emerald-600")}
//     />
//   );
// }

// interface RecentCallItemProps {
//   call: RecentCall;
//   onCallBack: () => void;
// }

// export function RecentCallItem({ call, onCallBack }: RecentCallItemProps) {
//   const MethodIcon = call.method === "video" ? Video : Phone;
//   const isMissed = call.direction === "missed";

//   return (
//     <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/60">
//       <Avatar className="size-10 shrink-0">
//         <AvatarFallback
//           className={cn(
//             "text-sm font-medium",
//             AVATAR_COLOR_CLASS[call.colorIndex]
//           )}
//         >
//           {getInitials(call.name)}
//         </AvatarFallback>
//       </Avatar>

//       <div className="min-w-0 flex-1">
//         <p
//           className={cn(
//             "truncate text-sm font-medium",
//             isMissed && "text-destructive"
//           )}
//         >
//           {call.name}
//         </p>
//         <div className="flex items-center gap-1 text-xs text-muted-foreground">
//           <DirectionIcon call={call} />
//           <span>{call.time}</span>
//         </div>
//       </div>

//       <Button
//         variant="ghost"
//         size="icon"
//         className="size-8 shrink-0 text-muted-foreground hover:text-primary"
//         onClick={onCallBack}
//         aria-label={`Call ${call.name} back`}
//       >
//         <MethodIcon className="size-4" />
//       </Button>
//     </div>
//   );
// }

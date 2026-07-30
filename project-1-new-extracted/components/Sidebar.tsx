"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation } from "./ChatBox";

type SidebarProps = {
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onCreateConversation?: () => void;
};

const navItems = [
  { icon: "📊", label: "Dashboard", href: "/dashboard" },
  { icon: "📈", label: "Analytics", href: "/dashboard" },
  { icon: "💬", label: "Chat History", href: "/" },
];

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-[calc(100vh-3rem)] w-full max-w-xs shrink-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_rgba(15,23,42,0.98))] px-6 py-8 text-amber-100 shadow-[0_36px_100px_rgba(15,23,42,0.45)] lg:flex lg:flex-col">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-10">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300/70">Command Center</p>
            <div className="mt-4 flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-400/10 text-xl text-amber-300 shadow-[0_10px_30px_rgba(250,204,21,0.1)]">
                👑
              </span>
              <div>
                <h2 className="text-3xl font-semibold text-white">MetricMind</h2>
                <p className="mt-2 max-w-[18rem] text-sm leading-6 text-amber-100/75">
                  A refined control panel for strategic analytics and AI prompts.
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-3 text-sm leading-7 text-amber-100/85">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-amber-300/40 bg-amber-300/10 text-white shadow-[inset_0_0_0_1px_rgba(250,204,21,0.14)]"
                      : "border-slate-800 bg-slate-950/70 text-amber-100/85 hover:border-amber-400/40 hover:bg-slate-900/90 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {conversations && (
            <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/75 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-200/80">History</p>
                <button
                  type="button"
                  onClick={onCreateConversation}
                  className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/20"
                >
                  New chat
                </button>
              </div>

              <div className="max-h-[16rem] space-y-2 overflow-y-auto pr-1">
                {conversations.map((conversation) => {
                  const isActive = activeConversationId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => onSelectConversation?.(conversation.id)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-amber-300/40 bg-slate-900/95 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.1)]"
                          : "border-slate-800 bg-slate-950/85 hover:border-amber-400/30 hover:bg-slate-900/90"
                      }`}
                    >
                      <p className="truncate text-sm font-medium text-amber-100">{conversation.title}</p>
                      <p className="mt-1 text-[11px] text-amber-100/65">{conversation.updatedAt}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}

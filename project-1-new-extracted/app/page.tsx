"use client";

import { useState } from "react";
import ChatBox, { type ChatMessage, type Conversation } from "@/components/ChatBox";
import Sidebar from "@/components/Sidebar";

const createConversation = (id: string, title: string, messages: ChatMessage[]): Conversation => ({
  id,
  title,
  updatedAt: "Just now",
  messages,
});

const initialConversations: Conversation[] = [
  createConversation("conv-1", "Weekly sales review", [
    {
      text: "How did sales perform this week?",
      sender: "user",
      timestamp: "9:41 AM",
    },
    {
      text: "Revenue held steady, with strong growth in the Northeast region and a small dip in retention from enterprise customers.",
      sender: "bot",
      timestamp: "9:42 AM",
    },
  ]),
  createConversation("conv-2", "Customer feedback summary", [
    {
      text: "Summarize customer feedback.",
      sender: "user",
      timestamp: "Yesterday",
    },
    {
      text: "Customers praised faster delivery and easier onboarding. A few noted follow-up support would be improved.",
      sender: "bot",
      timestamp: "Yesterday",
    },
  ]),
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversations[0].id);

  const createNewConversation = () => {
    const conversationId = `conv-${Date.now()}`;
    const nextConversation = createConversation(conversationId, "New conversation", []);

    setConversations((current) => [nextConversation, ...current]);
    setActiveConversationId(conversationId);
  };

  const updateConversation = (conversationId: string, messages: ChatMessage[]) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages,
              title:
                conversation.title === "New conversation" && messages[0]?.sender === "user"
                  ? messages[0].text.slice(0, 28) || conversation.title
                  : conversation.title,
              updatedAt: "Just now",
            }
          : conversation
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onCreateConversation={createNewConversation}
        />
        <div className="flex-1">
          <ChatBox
            conversationId={activeConversationId}
            conversations={conversations}
            onUpdateConversation={updateConversation}
          />
        </div>
      </div>
    </main>
  );
}

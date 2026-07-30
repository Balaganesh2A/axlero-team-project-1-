"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message";

export type ChatMessage = {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  chartData?: any[];
  chartQuery?: {
    measures?: string[];
    dimensions?: string[];
    timeDimensions?: any[];
  };
  debug?: { query: object; sql: string };
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type ChatBoxProps = {
  conversationId: string;
  conversations: Conversation[];
  onUpdateConversation: (conversationId: string, messages: ChatMessage[]) => void;
};

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatBox({
  conversationId,
  conversations,
  onUpdateConversation,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(1);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId),
    [conversationId, conversations]
  );
  const messages = useMemo(() => activeConversation?.messages ?? [], [activeConversation]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setDots((current) => (current % 3) + 1);
    }, 400);

    return () => window.clearInterval(interval);
  }, [loading]);

  const getBotResponse = async (prompt: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: conversationId, message: prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response");
    }

    return {
      text: data.answer,
      chartData: data.chartData,
      chartQuery: data.chartQuery,
      debug: data.debug,
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation) return;

    const prompt = input.trim();
    const userMessage: ChatMessage = {
      text: prompt,
      sender: "user",
      timestamp: formatTimestamp(new Date()),
    };

    const userMessages = [...messages, userMessage];
    onUpdateConversation(activeConversation.id, userMessages);
    setInput("");
    setLoading(true);

    try {
      const botResult = await getBotResponse(prompt);
      const botMessage: ChatMessage = {
        text: botResult.text,
        sender: "bot",
        timestamp: formatTimestamp(new Date()),
        chartData: botResult.chartData,
        chartQuery: botResult.chartQuery,
        debug: botResult.debug,
      };

      onUpdateConversation(activeConversation.id, [...userMessages, botMessage]);
    } catch (error) {
      const botMessage: ChatMessage = {
        text: error instanceof Error ? error.message : "Something went wrong",
        sender: "bot",
        timestamp: formatTimestamp(new Date()),
      };

      onUpdateConversation(activeConversation.id, [...userMessages, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-[620px] w-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6">
      <div className="mb-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">MetricMind AI Assistant</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ask a question and get insights from your assistant.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {activeConversation?.title ?? "Conversation"}
          </span>
        </div>
      </div>

      <div
        ref={messageListRef}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Welcome to MetricMind</h2>
            <p className="mt-2 text-sm text-slate-600">Ask your first question.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message
              key={`${message.sender}-${message.timestamp}-${index}`}
              text={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
              chartData={message.chartData}
              chartQuery={message.chartQuery}
              debug={message.debug}
            />
          ))
        )}

        {loading && (
          <div className="flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>Bot is typing</span>
            <span className="text-slate-400">{".".repeat(dots)}</span>
          </div>
        )}
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white"
          disabled={loading || !input.trim()}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

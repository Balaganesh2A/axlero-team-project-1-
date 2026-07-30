export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

const sessions = new Map<string, ChatMessage[]>();

export function createSession(sessionId: string): ChatMessage[] {
  const existing = sessions.get(sessionId);

  if (existing) {
    return existing;
  }

  const messages: ChatMessage[] = [];
  sessions.set(sessionId, messages);
  return messages;
}

export function getSession(sessionId: string): ChatMessage[] | undefined {
  return sessions.get(sessionId);
}

export function addMessage(sessionId: string, message: ChatMessage): ChatMessage[] {
  const session = sessions.get(sessionId) ?? createSession(sessionId);
  session.push(message);
  return session;
}

export function clearSession(sessionId: string): void {
  sessions.set(sessionId, []);
}

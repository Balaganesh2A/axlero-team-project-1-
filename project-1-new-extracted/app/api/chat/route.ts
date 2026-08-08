import { addMessage, createSession, getSession } from "@/lib/sessions";
import { generateCubeQuery, formatAnswer } from "@/lib/langchain";

type ChatRequestBody = {
  sessionId?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!rawBody) {
    return Response.json({ error: "Request body is required" }, { status: 400 });
  }

  let body: ChatRequestBody;

  try {
    body = JSON.parse(rawBody) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!message) {
      return Response.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (!getSession(sessionId)) {
      createSession(sessionId);
    }

    addMessage(sessionId, { role: "user", content: message });

    const cubeResult = await generateCubeQuery(message);

    if ("error" in cubeResult) {
      return Response.json({ error: cubeResult.error }, { status: 400 });
    }

    const cubeApiResponse = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cubeResult.query),
    });

    if (!cubeApiResponse.ok) {
      const errorText = await cubeApiResponse.text();
      console.error("Cube API failed:", cubeApiResponse.status, errorText);
      return Response.json(
        { error: "Cube API request failed", details: errorText },
        { status: cubeApiResponse.status }
      );
    }

    const cubeData = await cubeApiResponse.json();
    const rawData = cubeData.data ?? [];
    const cubeQuery = cubeResult.query;
    const answer = formatAnswer(cubeQuery, rawData);

    addMessage(sessionId, { role: "assistant", content: answer });

    const history = getSession(sessionId) ?? [];

    console.log("-----------------------------------");
    console.log("[REQUEST]");
    console.log(`Session: ${sessionId}`);
    console.log(`User: ${message}`);
    console.log("-----------------------------------");
    console.log("[RESPONSE]");
    console.log(answer);
    console.log("-----------------------------------");
    console.log("Current History:");
    for (const entry of history) {
      console.log(`${entry.role === "user" ? "User" : "Bot"}: ${entry.content}`);
    }
    console.log("-----------------------------------");

    return Response.json({
      answer,
      history,
      debug: cubeData.debug,
      chartData: rawData,
      chartQuery: cubeQuery,
    });
  } catch (error) {
    console.error("[CHAT API ERROR]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
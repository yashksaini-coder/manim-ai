import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import Groq from "groq-sdk";
import { sytemPrompt } from "@/lib/prompt";
// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the proper types for Groq messages
type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { clerkId, sessionId, prompt, model = "llama-3.3-70b-versatile" } = await request.json();
    
    if (!clerkId || !sessionId || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, sessionId, prompt" },
        { status: 400 }
      );
    }

    // Get previous messages from the session to build context
    const previousMessages = await convex.query(api.messages.getMessagesBySessionId, {
      clerkId,
      sessionId
    });

    // Format previous messages for Groq with the correct types
    const messageHistory: ChatMessage[] = previousMessages.map(msg => ({
      role: msg.role === "ai" ? "assistant" as const : "user" as const,
      content: msg.content
    }));

    // Add the new user message
    messageHistory.push({
      role: "user" as const,
      content: prompt
    });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {role: "system", content: sytemPrompt},
        {role: "user", content: prompt}
      ],
      model: model

    });

    // Get AI response
    const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    // Store user message in Convex
    await convex.mutation(api.messages.createMessage, {
      clerkId,
      sessionId,
      role: "user",
      content: prompt,
    });

    // Store AI response in Convex
    const messageId = await convex.mutation(api.messages.createMessage, {
      clerkId,
      sessionId,
      role: "ai",
      content: aiResponse,
    });

    return NextResponse.json({ 
      messageId, 
      content: aiResponse
    });
  } catch (error) {
    console.error("Error in chat completion:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clerkId = searchParams.get("clerkId");
    const sessionId = searchParams.get("sessionId");

    if (!clerkId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required query params: clerkId and sessionId" },
        { status: 400 }
      );
    }

    const messages = await convex.query(api.messages.getMessagesBySessionId, {
      clerkId,
      sessionId,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export async function POST(request: NextRequest) {
  try {
    const { clerkId, sessionId, role, content, videoId } = await request.json();
    
    if (!clerkId || !sessionId || !role || !content) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, sessionId, role, content" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.messages.createMessage, {
      clerkId,
      sessionId,
      role,
      content,
      videoId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clerkId = searchParams.get("clerkId");
    const sessionId = searchParams.get("sessionId");
    const latest = searchParams.get("latest");

    if (!clerkId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required query params: clerkId and sessionId" },
        { status: 400 }
      );
    }

    // If latest flag is provided, get the latest message only
    if (latest === "true") {
      const result = await convex.query(api.messages.getLatestMessageBySessionId, {
        clerkId,
        sessionId,
      });
      return NextResponse.json(result);
    }

    // Otherwise, get all messages for the session
    const result = await convex.query(api.messages.getMessagesBySessionId, {
      clerkId,
      sessionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
} 
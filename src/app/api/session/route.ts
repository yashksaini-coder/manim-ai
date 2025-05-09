import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export async function POST(request: NextRequest) {
  try {
    const { clerkId, prompt, title } = await request.json();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.sessions.createSession, {
      clerkId,
      prompt,
      title,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clerkId = searchParams.get("clerkId");
    const sessionId = searchParams.get("sessionId");

    if (!clerkId) {
      return NextResponse.json(
        { error: "Missing required query param: clerkId" },
        { status: 400 }
      );
    }

    // If sessionId is provided, get a specific session
    if (sessionId) {
      const result = await convex.query(api.sessions.getSessionById, {
        clerkId,
        sessionId,
      });
      return NextResponse.json(result);
    }

    // Otherwise, get all sessions for the user
    const result = await convex.query(api.sessions.getSessionsByClerkId, {
      clerkId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const result = await convex.mutation(api.sessions.deleteSession, {
      clerkId,
      sessionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { clerkId, sessionId, videoId } = await request.json();
    
    if (!clerkId || !sessionId || !videoId) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, sessionId, videoId" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.sessions.updateSessionWithVideo, {
      clerkId,
      sessionId,
      videoId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

// Helper function to clean Python code blocks
const cleanCode = (code: string) => {
  return code.replace(/```python/g, "").replace(/```/g, "");
};

// Generate code via API
async function generateCode(prompt: string, model: string = "llama-3.3-70b-versatile") {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_PROCESSOR;
    console.log(`Connecting to ${baseUrl}/v1/generate/code`);
    
    const response = await fetch(`${baseUrl}/v1/generate/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Code generation API error (${response.status}):`, errorText);
      throw new Error(`Failed to generate code: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return cleanCode(data.code);
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}

// Render animation via API
async function renderAnimation(code: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_PROCESSOR;
    console.log(`Connecting to ${baseUrl}/v1/render/video`);
    
    const response = await fetch(`${baseUrl}/v1/render/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: cleanCode(code),
        file_name: "GenScene.py",
        file_class: "GenScene",
        iteration: Math.floor(Math.random() * 1000000),
        project_name: "GenScene",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Render API error (${response.status}):`, errorText);
      throw new Error(`Failed to render animation: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.video_url) {
      console.error("API response missing video_url:", data);
      throw new Error("API response missing video_url");
    }
    
    console.log("Successfully rendered animation, received video URL");
    return data.video_url;
  } catch (error) {
    console.error("Error rendering animation:", error);
    throw error;
  }
}

// API endpoint to generate code and render animation
export async function POST(request: NextRequest) {
  try {
    const { clerkId, sessionId, prompt, model = "llama-3.3-70b-versatile" } = await request.json();
    
    if (!clerkId || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, prompt" },
        { status: 400 }
      );
    }

    // Step 1: Generate code
    console.log("Generating code for prompt:", prompt.substring(0, 50) + "...");
    const generatedCode = await generateCode(prompt, model);
    if (!generatedCode) {
      throw new Error("Failed to generate code");
    }
    
    // Step 2: Render animation
    console.log("Rendering animation with generated code");
    const videoUrl = await renderAnimation(generatedCode);
    
    // Step 3: Store video in database if we have valid data
    if (videoUrl && clerkId) {
      console.log("Creating video record in database");
      const videoId = await convex.mutation(api.videos.createVideo, {
        clerkId,
        videoUrl,
        code: generatedCode,
      });
      
      // Update session with video link if session ID is provided
      if (sessionId && videoId) {
        console.log("Updating session with video ID");
        await convex.mutation(api.sessions.updateSessionWithVideo, {
          clerkId,
          sessionId,
          videoId,
        });
      }
      
      return NextResponse.json({
        success: true,
        code: generatedCode,
        videoUrl: videoUrl,
        videoId: videoId || null,
      });
    } else {
      return NextResponse.json({
        success: true,
        code: generatedCode,
        videoUrl: videoUrl,
      });
    }
  } catch (error) {
    console.error("Error processing animation request:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate or render animation",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// API endpoint to get animation status (for future implementation of polling)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");
  
  if (!videoId) {
    return NextResponse.json(
      { error: "Missing required query param: videoId" },
      { status: 400 }
    );
  }
  
  // Placeholder for future implementation of status checking
  return NextResponse.json({
    status: "completed",
    videoId: videoId
  });
} 
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, availableSongs } = await request.json();

    if (!prompt || !availableSongs || availableSongs.length === 0) {
      return new NextResponse("Missing prompt or songs", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new NextResponse("Gemini API Key missing in environment.", { status: 500 });
    }

    const songsContext = availableSongs.map((s: any) => `ID: ${s.id} | Title: ${s.title} | Author: ${s.author}`).join("\n");

    const systemPrompt = `You are an AI DJ. The user will give you a prompt describing the mood, genre, or style of music they want to hear.
You must select the most appropriate songs from the provided catalog.
Return ONLY a JSON array of the string IDs of the songs you selected. No markdown, no explanations, just the JSON array.
If no songs match, return an empty array [].

Catalog:
${songsContext}`;

    // Using fetch directly to avoid requiring the user to npm install a specific SDK if it's not present
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${prompt}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return new NextResponse("AI API Error", { status: 500 });
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    let selectedIds: string[] = [];
    
    try {
      selectedIds = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse AI response:", responseText);
    }

    return NextResponse.json({ songIds: selectedIds });

  } catch (error) {
    console.error("Generate Playlist Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, author } = await req.json();

    if (!title || !author) {
      return new NextResponse("Missing title or author", { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new NextResponse("OPENAI_API_KEY is not configured.", { status: 500 });
    }

    const prompt = `Stunning album cover art for the song "${title}" by ${author}, high quality, vibrant, minimalist music aesthetic, no text, perfect square ratio.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "512x512"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[DALL-E ERROR]", errorData);
      return new NextResponse("Error from OpenAI API", { status: 500 });
    }

    const data = await response.json();
    const url = data.data[0].url;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[GENERATE_COVER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

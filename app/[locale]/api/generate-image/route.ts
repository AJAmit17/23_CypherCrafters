import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const payload = {
      prompt: prompt,
      output_format: "webp"
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*"
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Stability AI Error: ${response.status}`);
    }

    // Convert the image buffer to base64
    const base64Image = Buffer.from(response.data).toString('base64');
    const imageUrl = `data:image/webp;base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error("[IMAGE_GENERATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

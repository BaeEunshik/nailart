import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { buildThumbnailPrompt } from "@/lib/prompts/thumbnail";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, images, image, aspectRatio = "16:9" } = await request.json();

    // 하위 호환: 단일 image 필드도 지원
    const imageList: string[] = images ?? (image ? [image] : []);

    if (!prompt && imageList.length === 0) {
      return NextResponse.json(
        { error: "프롬프트 또는 이미지를 입력해주세요." },
        { status: 400 }
      );
    }

    // contents 구성
    const contents: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (prompt) {
      contents.push({ text: buildThumbnailPrompt(prompt) });
    }

    // 이미지 처리 (data URL 또는 일반 URL)
    for (const img of imageList) {
      const dataUrlMatch = img.match(
        /^data:(image\/[a-zA-Z+]+);base64,(.+)$/
      );
      if (dataUrlMatch) {
        contents.push({
          inlineData: {
            mimeType: dataUrlMatch[1],
            data: dataUrlMatch[2],
          },
        });
      } else if (img.startsWith("http")) {
        // 외부 URL인 경우 fetch하여 base64로 변환
        const res = await fetch(img);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = res.headers.get("content-type") || "image/png";
        contents.push({
          inlineData: {
            mimeType: contentType,
            data: base64,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio as
            | "1:1"
            | "2:3"
            | "3:2"
            | "3:4"
            | "4:3"
            | "4:5"
            | "5:4"
            | "9:16"
            | "16:9"
            | "21:9",
          imageSize: "1K",
        },
      },
    });

    let text: string | undefined;
    let imageData: string | undefined;
    let mimeType: string | undefined;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType;
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          error:
            "이미지를 생성하지 못했습니다. 다른 프롬프트를 시도해주세요.",
          text,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, imageData, mimeType });
  } catch (error) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

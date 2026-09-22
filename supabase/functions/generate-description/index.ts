import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  try {
    const body = await req.json();
    const {
      title = "",
      content = "",
      fileTypes = []
    } = body;

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
      Buatkan deskripsi singkat tapi menarik untuk konten/file berikut.
      Judul: ${title || "Tanpa judul"}
      Konten: ${content || "Tidak ada deskripsi"}
      Tipe file: ${fileTypes.length ? fileTypes.join(", ") : "Tidak ada file"}
      Tulis dalam Bahasa Indonesia, ringkas, rapi, mudah dibaca, dan terasa profesional.
      Hasil maksimal 2 paragraf.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Kamu adalah asisten penulis konten profesional yang handal."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: err }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await response.json();
    const description =
      json?.choices?.[0]?.message?.content?.trim() ||
      "Tidak ada deskripsi otomatis yang dihasilkan.";

    return new Response(
      JSON.stringify({ description }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

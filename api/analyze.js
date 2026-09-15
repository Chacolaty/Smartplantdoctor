const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const { image, language = "English" } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: "No image provided"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are an AI Plant Doctor.

Analyze this plant image carefully.

Language: ${language}

Give:
1. Plant name if identifiable
2. Likely disease or condition
3. Visible symptoms
4. Recommended treatment
5. Prevention advice

Do not claim certainty when the image is unclear.
If the image is not a plant or leaf image, clearly say so.
Keep the answer practical and easy to understand.`,
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      result: response.output_text,
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    return res.status(500).json({
      error: "AI analysis failed",
      details: error?.message || "Unknown error"
    });
  }
};

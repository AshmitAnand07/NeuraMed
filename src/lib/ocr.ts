import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initialize the Google Vision client safely
let client: ImageAnnotatorClient;

try {
  const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;
  const credentials = credentialsJson ? JSON.parse(credentialsJson) : undefined;

  if (credentials && credentials.private_key) {
    // Crucial: Replace escaped newlines with actual newlines
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  client = new ImageAnnotatorClient({
    credentials,
  });
} catch (error) {
  console.error("Failed to initialize Google Vision client:", error);
}

/**
 * Extracts text from an image buffer using Google Cloud Vision API
 * @param imageBuffer The image buffer to process
 * @returns The detected text string
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  if (!client) {
    throw new Error("Google Vision client not initialized. Check your GOOGLE_CLOUD_CREDENTIALS in .env.local.");
  }

  try {
    const [result] = await client.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      // The first item contains the entire detected text
      return detections[0].description || "";
    }

    return "";
  } catch (error: any) {
    console.error("OCR Error:", error);
    // Log the specific error message from Google
    throw new Error(`Vision API Error: ${error.message || "Failed to extract text"}`);
  }
}

import vision from "@google-cloud/vision";

// Initialize the Google Vision client
const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  : undefined;

const client = new vision.ImageAnnotatorClient({
  credentials,
});
/**
 * Extracts text from an image buffer using Google Cloud Vision API
 * @param imageBuffer The image buffer to process
 * @returns The detected text string
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const [result] = await client.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      // The first item contains the entire detected text
      return detections[0].description || '';
    }

    return '';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

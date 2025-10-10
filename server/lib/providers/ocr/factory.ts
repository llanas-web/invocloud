import { OcrProviderName } from "../../../../types/providers/ocr/mindee/types";
import type { OcrProvider } from "./provider";
import { MindeeProvider } from "./adapters/mindee";

export function getOcrProvider(name: OcrProviderName): OcrProvider {
    switch (name) {
        case "mindee":
            return new MindeeProvider();
        case "klippa":
            // return new KlippaProvider();
        // case "tesseract": return new TesseractProvider();
        default:
            throw new Error(`Unknown OCR provider: ${name}`);
    }
}

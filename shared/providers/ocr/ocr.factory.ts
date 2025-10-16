import type { OcrProviderName } from "~~/shared/types/providers/ocr/types";
import type { OcrProvider } from "./ocr.interface";
import OcrError from "./ocr.error";
import { MindeeRepository } from "./mindee/mindee.repository";

class OcrFactory {
    private static instance: OcrProvider;

    private constructor(providerName: OcrProviderName) {
        OcrFactory.instance = this.createProvider(providerName);
    }

    private createProvider(name: OcrProviderName): OcrProvider {
        switch (name) {
            case "mindee":
                return new MindeeRepository();
            case "klippa":
                // return new KlippaProvider();
            // case "tesseract": return new TesseractProvider();
            default:
                throw new OcrError(`Unknown OCR provider: ${name}`);
        }
    }

    public static getInstance(providerName: OcrProviderName): OcrProvider {
        if (!OcrFactory.instance) {
            new OcrFactory(providerName);
        }
        return OcrFactory.instance;
    }

    public static getOcrProvider(): OcrProvider {
        if (!OcrFactory.instance) {
            throw new OcrError(
                "OcrFactory not initialized. Call getInstance first.",
            );
        }
        return OcrFactory.instance;
    }
}

export default OcrFactory;

import OcrFactory from "~~/shared/providers/ocr/ocr.factory";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide("ocrFactory", OcrFactory.getInstance("mindee"));
});

import {
    definePayloadPlugin,
    definePayloadReducer,
    definePayloadReviver,
} from "nuxt/app";
import { PayloadModel } from "~~/shared/domain/common/payload.model";
import { InvoiceModel } from "~~/shared/domain/invoice/invoice.model";

export default definePayloadPlugin(() => {
    // Map minimale des modèles connus
    const ctors = {
        [InvoiceModel.payloadType]: InvoiceModel,
        // Ajoute ici d'autres modèles: [OtherModel.payloadType]: OtherModel
    };

    definePayloadReducer("PayloadModel", (data) => {
        // Ne réduire que les vraies instances de PayloadModel
        if (data instanceof PayloadModel) {
            const ctor = data.constructor as any;
            const type = ctor.payloadType ?? ctor.name;
            // Tagger le type + payload sérialisable
            return { __type: type, payload: data.toPayload() };
        }
        // Important: undefined => pas de réduction
        return undefined;
    });

    definePayloadReviver("PayloadModel", (data) => {
        // data est ce que retourne le reducer ci-dessus
        if (data && typeof data === "object" && "__type" in data) {
            const type = (data as any).__type as string;
            const payload = (data as any).payload;
            const Ctor = (ctors as any)[type];
            return Ctor?.fromPayload ? Ctor.fromPayload(payload) : data;
        }
        return data;
    });
});

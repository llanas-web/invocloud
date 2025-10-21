export abstract class PayloadModel {
    static payloadType: string = "PayloadModel";
    abstract toPayload(): object;
    // FromPayload should return the instance of the inheriting class
    abstract fromPayload(data: any): this;
}

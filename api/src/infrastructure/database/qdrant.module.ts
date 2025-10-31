import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: process.env.QDRANT_URL });

export const QdrantProvider = {
    provide: "QDRANT_CLIENT",
    useValue: client
};


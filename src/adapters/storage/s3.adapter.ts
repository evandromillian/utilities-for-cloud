import { S3Client } from "@aws-sdk/client-s3";

export class S3Adapter {
    s3Client: S3Client;

    constructor(client: S3Client) {
        if (client) {
            this.s3Client = client;
        } else {

        }
    }
}
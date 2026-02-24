import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const testS3Connection = async () => {
  console.log("Testing S3 connection...");
  console.log("Region:", process.env.S3_REGION);
  console.log("Bucket:", process.env.S3_BUCKET_NAME);

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1,
    });
    const response = await s3Client.send(command);
    console.log("✅ Success! Connection verified.");
    console.log("Bucket status: Accessible");
    if (response.Contents) {
      console.log(`Found ${response.KeyCount} objects (limited to 1 for test).`);
    } else {
      console.log("Bucket is currently empty.");
    }
  } catch (error) {
    console.error("❌ S3 Connection Failed!");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.name);
  }
};

testS3Connection();

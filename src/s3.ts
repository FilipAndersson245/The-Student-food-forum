import { Credentials, S3, AWSError } from "aws-sdk";

const awsCredentials = new Credentials(
  process.env.AWS_IAM_ACCESSKEY as string,
  process.env.AWS_IAM_SECRETACCESSKEY as string
);

const s3 = new S3({
  credentials: awsCredentials,
  region: process.env.AWS_IAM_REGION as string
});

export const uploadToS3 = (
  file: Buffer,
  destFileName: string,
  callback?: ((err: AWSError, data: S3.ManagedUpload.SendData) => void)
) => {
  console.log("Hej!");
  s3.upload({
    Bucket: process.env.AWS_S3_BUCKETNAME as string,
    Key: destFileName,
    Body: file
  })
    .on("httpUploadProgress", console.log)
    .send(callback);
};

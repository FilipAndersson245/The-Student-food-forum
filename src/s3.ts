import { Credentials, S3, AWSError } from "aws-sdk";

const awsCredentials = new Credentials(
  process.env.AWS_IAM_ACCESSKEY as string,
  process.env.AWS_IAM_SECRETACCESSKEY as string
);

const s3 = new S3({
  credentials: awsCredentials,
  region: process.env.AWS_IAM_REGION as string
});

export const uploadRecipeImageToS3 = (
  file: Buffer,
  destFileName: string,
  contentType: string,
  callback?: ((err: AWSError, data: S3.ManagedUpload.SendData) => void)
) => uploadImagesToS3(file, `recipes/${destFileName}`, contentType, callback);

export const uploadAccountImageToS3 = (
  file: Buffer,
  destFileName: string,
  contentType: string,
  callback?: ((err: AWSError, data: S3.ManagedUpload.SendData) => void)
) => uploadImagesToS3(file, `accounts/${destFileName}`, contentType, callback);

const uploadImagesToS3 = (
  file: Buffer,
  destFileName: string,
  contentType: string,
  callback?: ((err: AWSError, data: S3.ManagedUpload.SendData) => void)
) =>
  s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKETNAME as string,
      Key: destFileName,
      Body: file,
      ContentType: contentType
    })
    .send(callback);

export const deleteRecipeImageInS3 = (
  destFileName: string,
  callback?: ((err: AWSError, data: S3.DeleteObjectOutput) => void)
) => deleteImageInS3(`recipes/${destFileName}`, callback);

export const deleteAccountImageInS3 = (
  destFileName: string,
  callback?: ((err: AWSError, data: S3.DeleteObjectOutput) => void)
) => deleteImageInS3(`accounts/${destFileName}`, callback);

const deleteImageInS3 = (
  destFileName: string,
  callback?: ((err: AWSError, data: S3.DeleteObjectOutput) => void)
) =>
  s3
    .deleteObject({
      Bucket: process.env.AWS_S3_BUCKETNAME as string,
      Key: destFileName
    })
    .send(callback);

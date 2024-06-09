require('dotenv').config();

module.exports = {
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME
};

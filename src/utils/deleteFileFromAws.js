const { S3 } = require("@aws-sdk/client-s3");

const s3 = new S3({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

exports.deleteFileFromCloud = async (fileName, userId) => {
  const myBucket = process.env.BUCKETNAME;
  console.log(fileName);
  console.log(userId)
  const params = {
    Bucket: myBucket,
    Key: `${userId}/` + fileName,
  };

  await s3.deleteObject(params)
    .then(() => {
      console.log("Succesfully! File deleted!");
    })
    .catch((err) => console.log(err));
}
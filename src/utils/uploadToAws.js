const { S3 } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3 = new S3({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

exports.uploadFileToCloud = async (fileName, userId) => {
  const filePath = './uploads/' + fileName;
  const fileStream = fs.createReadStream(filePath);

  const myBucket = process.env.BUCKETNAME;

  const params = {
    Bucket: myBucket,
    Key: `${userId}/` + fileName,
    Body: fileStream,
    ContentType: 'application/pdf',
    ACL: 'public-read'
  };

  await s3.putObject(params)
    .then(() => {
      console.log("Succesfully! File uploaded!");
    })
    .catch((err) => console.log(err));
  await fs.rm(filePath, (err) => {if (err) console.log(err)});
  const newFileName = fileName.split(' ').join('+');
  return `https://${process.env.BUCKETNAME}.s3.${process.env.REGION}.amazonaws.com/${userId}/${newFileName}`
}
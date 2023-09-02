
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIA25H5CEJ67OZDWCE2",
        secretAccessKey: "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"
    }
})



async function GetObjectUrl(key) {
    const CreateObjUrl = new GetObjectCommand({
        Bucket: "hotelio-images",
        Key: key
    })
    const signedUrl = await getSignedUrl(s3Client, CreateObjUrl)
    return signedUrl
}

async function PutObj(fileName, contentType) {
    const command = new PutObjectCommand({
        Bucket: "hotelio-images",
        Key: `${fileName}`, // Change 'Key' to 'key'
        ContentType: contentType
    })

    const url = await getSignedUrl(s3Client, command)
    return url
}

async function init() {
    // console.log(await PutObj(`img-${Date.now()}.jpg`, 'image/*'))
    console.log(await GetObjectUrl("img-1693562598032.jpg"))
}





init()





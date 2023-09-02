const multer = require('multer');
require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const CustomerAuthModel = require('../Model/CustomerModels/CustomerAuthModel');

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETACCESSKEY
    }
})


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadFolder = path.join('static', 'uploads', req.params.folder);
        if (!fs.existsSync(uploadFolder)) {
            try {
                fs.mkdirSync(uploadFolder, { recursive: true });
            } catch (err) {
                console.error('Error creating folder:', err);
            }
        }
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({ storage });

router.post('/uploadfile/:folder', upload.single('myfile'), (req, res) => {
    const fileName = req.file.filename;
    res.status(200).json({ message: 'Successfully Uploaded', fileName: `${req.params.folder}/${fileName}` });
});


router.get("/s3/upload", async (req, res) => {

    const { id, fileName } = req.query;

    // generate the file Name And PAth
    const GeneratePath = `${id}/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
        Bucket: "hotelio-images",
        Key: GeneratePath,
        ContentType: "image/*"
    })

    const UploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 })

    res.status(200).json({ error: false, url: UploadUrl, UploadedPath: GeneratePath })
})


// function to genereate objurl 
async function GetSignedUrlOfImage(key) {
    const command = new GetObjectCommand({
        Bucket: "hotelio-images",
        Key: key
    });

    try {
        // Get signed URL
        const url = await getSignedUrl(s3Client, command);
        return url;
    } catch (error) {
        throw error; // Rethrow the error for proper handling in the route handler
    }
}

router.get('/s3/signedurl', async (req, res) => {
    try {
        const { key } = req.query;

        const imgUrl = await GetSignedUrlOfImage(key);

        res.status(200).json({ error: false, url: imgUrl });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        res.status(500).json({ error: true, message: "Error generating signed URL" });
    }
});


module.exports = router;

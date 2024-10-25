const multer = require("multer");
require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { default: axios } = require("axios");

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const serverImagesContainerClient = blobServiceClient.getContainerClient(
  "server-images-container"
);

const newStorage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = path.join("static", "uploads", req.params.folder);
    if (!fs.existsSync(uploadFolder)) {
      try {
        fs.mkdirSync(uploadFolder, { recursive: true });
      } catch (err) {
        console.error("Error creating folder:", err);
      }
    }
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });
const storeMemory = multer({ storage: newStorage });

router.post("/uploadfile/:folder", upload.single("myfile"), (req, res) => {
  const fileName = req.file.filename;
  res.status(200).json({
    message: "Successfully Uploaded",
    fileName: `${req.params.folder}/${fileName}`,
  });
});

router.get("/s3/upload", async (req, res) => {
  const { id, fileName } = req.query;
  const fileExtension = path.extname(fileName).toLowerCase();

  // Check if the file extension is one of the accepted formats
  if (
    fileExtension !== ".jpeg" &&
    fileExtension !== ".jpg" &&
    fileExtension !== ".png" &&
    fileExtension !== ".pdf"
  ) {
    return res
      .status(400)
      .json({ error: true, message: "Unsupported file format" });
  }

  // Generate the file Name And Path
  const GeneratePath = `${id}/${Date.now()}-${fileName}`;

  // creating a new blob client for the image
  const imageBlobClient = serverImagesContainerClient.getBlockBlobClient(GeneratePath);

    // Upload the image to the blob

  //   const command = new PutObjectCommand({
  //     Bucket: "hotelio-images",
  //     Key: GeneratePath,
  //     ContentType:
  //       fileExtension === ".pdf"
  //         ? "application/pdf"
  //         : `image/${fileExtension.slice(1)}`,
  //   });

  const UploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });

  res.status(200).json({
    error: false,
    url: UploadUrl,
    UploadedPath: GeneratePath,
    UploadedUrl: `https://hotelio-images.s3.ap-south-1.amazonaws.com/${GeneratePath}`,
  });
});

// function to genereate objurl
async function GetSignedUrlOfImage(key) {
  const command = new GetObjectCommand({
    Bucket: "hotelio-images",
    Key: key,
  });

  try {
    // Get signed URL
    const url = await getSignedUrl(s3Client, command);
    return url;
  } catch (error) {
    throw error; // Rethrow the error for proper handling in the route handler
  }
}

router.get("/s3/signedurl", async (req, res) => {
  try {
    const { key } = req.query;

    const imgUrl = await GetSignedUrlOfImage(key);

    res.status(200).json({ error: false, url: imgUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res
      .status(500)
      .json({ error: true, message: "Error generating signed URL" });
  }
});

router.post(
  "/upload/file/directly",
  storeMemory.single("file"),
  async (req, res) => {
    const { fileName } = req.query;
    const file = req.file;

    try {
      const generatePath = `${Date.now()}-${fileName}`;

      const fileBlobClient = serverImagesContainerClient.getBlockBlobClient(generatePath)
      const fileUploadResponse = await fileBlobClient.upload(file.buffer, file.size);

      if( fileUploadResponse._response.status !== 201)
        return res
          .status(400)
          .json({ error: true, message: "Failed to upload file" });

      res.status(200).json({
        error: false,
        message: "Success",
        fileName: fileUploadResponse._response.request.url,
      });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  }
);

module.exports = router;

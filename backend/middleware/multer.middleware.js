import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join("public", "uploads");

// create folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueStorage = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);//change here 
    cb(null, file.fieldname + "_" + uniqueStorage + ext);//+ ext and this
  },
});

export const upload = multer({ storage });
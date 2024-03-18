import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //but add some sufix for avoid override when there is multiple file with same name
  },
});

export const upload = multer({ storage });

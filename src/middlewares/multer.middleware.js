import multer from "multer"
import path from "path"
//it is used to store files in server
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage: storage })
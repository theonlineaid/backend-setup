import { Router } from "express";
import uploadCtrl from "../controllers/UploadCtrl";

const UploadRouter: Router = Router();

UploadRouter.post('/img', uploadCtrl.uploadBanner )
UploadRouter.put('/img', uploadCtrl.updateBanner )


export default UploadRouter;
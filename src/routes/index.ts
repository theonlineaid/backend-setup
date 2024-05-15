import { Router } from "express";
import AuthRouter from "./auth";
import ProductRouter from "./product";
import UserRouter from "./users";
import UploadRouter from "./upload";

const RootRouter = Router();

RootRouter.use("/auth", AuthRouter)
RootRouter.use("/products", ProductRouter)
RootRouter.use("/users", UserRouter)
RootRouter.use("/upload", UploadRouter)


export default RootRouter;
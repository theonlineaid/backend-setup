import { Router } from "express";
import AuthRouter from "./auth";
import ProductRouter from "./product";
import UserRouter from "./users";
import UploadRouter from "./upload";
import CartRouter from "./cart";
import ReviewRouter from "./review";
import OrderRouter from "./order";

const RootRouter = Router();

RootRouter.use("/auth", AuthRouter)
RootRouter.use("/products", ProductRouter)
RootRouter.use("/reviews", ReviewRouter)
RootRouter.use("/users", UserRouter)
RootRouter.use("/cart", CartRouter)
RootRouter.use("/upload", UploadRouter)
RootRouter.use("/orders", OrderRouter)


export default RootRouter;
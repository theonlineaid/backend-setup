import { Router } from "express";
import AuthRouter from "./auth";
import ProductRouter from "./product";

const RootRouter = Router();

RootRouter.use("/auth", AuthRouter)
RootRouter.use("/products", ProductRouter)


export default RootRouter;
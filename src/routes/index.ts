import { Router } from "express";
import AuthRouter from "./auth";

const RootRouter = Router();

RootRouter.use("/auth", AuthRouter)


export default RootRouter;
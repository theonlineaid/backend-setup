import {Response, Request} from "express";

const authCtrl = {
    login: (req: Request, res: Response) => {
        res.status(200).json({message: 'login'});
    },
    register: (req: Request, res: Response) => {
        res.status(200).json({message:'register'});
    }
};

export default authCtrl;
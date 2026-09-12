import { Router } from 'express';
import UserController from './components/user/user.controller';

export default function registerRoutes(): Router {
    const router = Router();

    const userController = new UserController();
    router.use('/api/user', userController.register());

    return router;
}
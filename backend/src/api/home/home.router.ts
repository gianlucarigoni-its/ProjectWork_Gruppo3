import { Router } from 'express';
import { getHomeDashboard } from './home.controller';

const router = Router();


router.get('/', getHomeDashboard);

export default router;
import express from 'express';
import { createReview } from '../controllers/reviewController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createReview);

export default router;

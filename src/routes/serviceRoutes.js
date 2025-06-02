import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  uploadImageMiddleware
} from '../controllers/serviceController.js';

import verifyToken from '../middlewares/verifyToken.js';
import { authorizeService } from '../middlewares/authorizeService.js';

const router = express.Router();

router.get('/', getAllServices);

router.get('/:id', getServiceById);

router.get('/my', verifyToken, authorizeService, getMyServices);

router.post('/', verifyToken, authorizeService, uploadImageMiddleware, createService);

router.put('/:id', verifyToken, authorizeService, updateService);

router.delete('/:id', verifyToken, authorizeService, deleteService);

export default router;

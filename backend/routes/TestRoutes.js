import express from 'express';
import {
  getAllTests,
  getTestDetails,
  createTest,
  updateTest,
  deleteTest
} from '../controllers/Test.js';

const router = express.Router();

router.get('/', getAllTests);
router.get('/:id/details', getTestDetails);
router.post('/new', createTest);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);

export default router;

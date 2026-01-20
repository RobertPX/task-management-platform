import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
  getUserStats
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users (for member selection)
 * @access  Private
 * @query   search, role
 */
router.get('/', getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get current user statistics
 * @access  Private
 */
router.get('/stats', getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', getUser);

/**
 * @route   PUT /api/users
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/', updateUser);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', changePassword);

/**
 * @route   DELETE /api/users
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete('/', deleteUser);

export default router;
import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for authenticated user
 * @access  Private
 * @query   status, search
 */
router.get('/', getProjects);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', createProject);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', getProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Owner only)
 */
router.put('/:id', updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Owner only)
 */
router.delete('/:id', deleteProject);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project
 * @access  Private (Owner only)
 */
router.post('/:id/members', addMember);

/**
 * @route   DELETE /api/projects/:id/members/:memberId
 * @desc    Remove member from project
 * @access  Private (Owner only)
 */
router.delete('/:id/members/:memberId', removeMember);

export default router;
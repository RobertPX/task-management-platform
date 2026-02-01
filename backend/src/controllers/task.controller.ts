import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional().nullable()
});

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { projectId, status, priority, assigneeId } = req.query;

    const where: any = {
      project: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const validatedData = createTaskSchema.parse(req.body);

    // Check if user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access'
      });
      return;
    }

    // If assigneeId is provided, check if they have access to the project
    if (validatedData.assigneeId) {
      const hasAccess = await prisma.project.findFirst({
        where: {
          id: validatedData.projectId,
          OR: [
            { ownerId: validatedData.assigneeId },
            { members: { some: { userId: validatedData.assigneeId } } }
          ]
        }
      });

      if (!hasAccess) {
        res.status(400).json({
          success: false,
          message: 'Assignee does not have access to this project'
        });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
      return;
    }
    next(error);
  }
};

export const updateTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission'
      });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
      return;
    }
    next(error);
  }
};

export const updateTaskStatus = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission'
      });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission'
      });
      return;
    }

    await prisma.task.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
      return;
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission'
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};
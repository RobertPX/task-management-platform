import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, search } = req.query;

    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const validatedData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        ownerId: userId,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null
      },
      include: {
        owner: {
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
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);

    // Check if user is owner
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update it'
      });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if user is owner
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it'
      });
      return;
    }

    await prisma.project.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { userId: memberUserId, role } = req.body;

    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
      return;
    }

    // Check if member already exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberUserId
        }
      }
    });

    if (existingMember) {
      res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
      return;
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: memberUserId,
        role: role || 'MEMBER'
      },
      include: {
        user: {
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
      message: 'Member added successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id, memberId } = req.params;

    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
      return;
    }

    await prisma.projectMember.delete({
      where: {
        id: memberId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
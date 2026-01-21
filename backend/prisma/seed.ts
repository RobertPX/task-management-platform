import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER'
    }
  });

  console.log('✅ Users created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'ACTIVE',
      ownerId: user1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      members: {
        create: [
          {
            userId: user2.id,
            role: 'DEVELOPER'
          },
          {
            userId: user3.id,
            role: 'DESIGNER'
          }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build native mobile apps for iOS and Android',
      status: 'ACTIVE',
      ownerId: user1.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      members: {
        create: [
          {
            userId: user2.id,
            role: 'LEAD_DEVELOPER'
          }
        ]
      }
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Marketing Campaign',
      description: 'Q1 2024 marketing campaign planning and execution',
      status: 'COMPLETED',
      ownerId: user2.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31')
    }
  });

  console.log('✅ Projects created');

  // Create tasks
  await prisma.task.createMany({
    data: [
      // Website Redesign tasks
      {
        title: 'Design homepage mockup',
        description: 'Create high-fidelity mockup for new homepage',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: user3.id,
        dueDate: new Date('2024-01-15')
      },
      {
        title: 'Develop responsive navigation',
        description: 'Implement mobile-first navigation component',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-01-20')
      },
      {
        title: 'Setup analytics tracking',
        description: 'Integrate Google Analytics 4',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-02-01')
      },
      {
        title: 'Content migration',
        description: 'Migrate existing content to new CMS',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        dueDate: new Date('2024-02-15')
      },
      // Mobile App tasks
      {
        title: 'Setup React Native project',
        description: 'Initialize React Native project with TypeScript',
        status: 'DONE',
        priority: 'URGENT',
        projectId: project2.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-02-05')
      },
      {
        title: 'Design authentication flow',
        description: 'Create user authentication screens and flow',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        projectId: project2.id,
        assigneeId: user3.id,
        dueDate: new Date('2024-02-20')
      },
      {
        title: 'Implement push notifications',
        description: 'Setup Firebase Cloud Messaging',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: project2.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-03-01')
      },
      // Marketing Campaign tasks
      {
        title: 'Create social media content calendar',
        description: 'Plan content for Instagram, Twitter, and LinkedIn',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project3.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-01-10')
      },
      {
        title: 'Launch email campaign',
        description: 'Send newsletter to subscriber list',
        status: 'DONE',
        priority: 'MEDIUM',
        projectId: project3.id,
        assigneeId: user2.id,
        dueDate: new Date('2024-02-01')
      }
    ]
  });

  console.log('✅ Tasks created');

  // Create some comments
  const tasks = await prisma.task.findMany();
  
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great work on the mockup! Looks fantastic.',
        taskId: tasks[0].id,
        authorId: user1.id
      },
      {
        content: 'Thanks! I made some adjustments based on the feedback.',
        taskId: tasks[0].id,
        authorId: user3.id
      },
      {
        content: 'The navigation is working well on mobile. Just need to add some animations.',
        taskId: tasks[1].id,
        authorId: user2.id
      }
    ]
  });

  console.log('✅ Comments created');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'New task assigned',
        message: 'You have been assigned to "Develop responsive navigation"',
        type: 'TASK_ASSIGNED',
        userId: user2.id
      },
      {
        title: 'Task completed',
        message: 'Jane completed "Design homepage mockup"',
        type: 'TASK_COMPLETED',
        userId: user1.id
      }
    ]
  });

  console.log('✅ Notifications created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
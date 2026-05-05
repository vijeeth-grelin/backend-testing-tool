import prisma from './lib/db';
import { hashPassword } from './lib/auth';

async function main() {
  const adminEmail = 'admin@grelinhealth.ai';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
      }
    });
    console.log('Admin user seeded: admin@grelinhealth.ai / admin123');
  } else {
    console.log('Admin user already exists');
  }

  // Create a default project if none exist
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        name: 'Sample CRM Service',
        description: 'Internal API documentation for the CRM backend service.',
      }
    });
    console.log('Sample project seeded: Sample CRM Service');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

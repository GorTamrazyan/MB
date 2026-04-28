import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'web-development' }, update: {}, create: { name: 'Վեբ Մշակում', slug: 'web-development', icon: '💻', order: 1 } }),
    prisma.category.upsert({ where: { slug: 'design' }, update: {}, create: { name: 'Դիզայն', slug: 'design', icon: '🎨', order: 2 } }),
    prisma.category.upsert({ where: { slug: 'marketing' }, update: {}, create: { name: 'Մարքեթինգ', slug: 'marketing', icon: '📢', order: 3 } }),
    prisma.category.upsert({ where: { slug: 'it-consulting' }, update: {}, create: { name: 'IT Կոնսալթինգ', slug: 'it-consulting', icon: '🔧', order: 4 } }),
    prisma.category.upsert({ where: { slug: 'accounting' }, update: {}, create: { name: 'Հաշվապահություն', slug: 'accounting', icon: '📊', order: 5 } }),
  ]);

  // Admin user
  const adminHash = await bcrypt.hash('Admin123456!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tina.com' },
    update: {},
    create: {
      email: 'admin@tina.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
      profile: { create: { firstName: 'Admin', lastName: 'Tina' } },
    },
  });

  // Company user
  const companyHash = await bcrypt.hash('Company123!', 12);
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@example.com' },
    update: {},
    create: {
      email: 'company@example.com',
      passwordHash: companyHash,
      role: 'COMPANY',
      isVerified: true,
      profile: { create: { firstName: 'Aram', lastName: 'Hakobyan' } },
    },
  });

  const company = await prisma.company.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      companyName: 'TechSolutions AM',
      legalName: 'ՍՊԸ «ՏեքՍոլյուշնս»',
      description: 'Ժամանակակից IT լուծումներ բիզնեսի համար',
      isVerified: true,
      averageRating: 4.5,
      addresses: {
        create: { type: 'MAIN', country: 'Հայաստան', city: 'Երևան', street: 'Հ. Ղ. Զոհրապ 2/2', isPrimary: true },
      },
    },
  });

  // Services
  const service1 = await prisma.service.upsert({
    where: { slug: 'website-development-basic' },
    update: {},
    create: {
      companyId: company.id,
      categoryId: categories[0].id,
      title: 'Կայքի մշակում (Basic)',
      slug: 'website-development-basic',
      description: 'Landing page կամ կորպորատիվ կայքի ստեղծում React/Next.js տեխնոլոգիաներով։ Ներառում է responsive design, SEO оптимизация, 3 ամիս անվճար սպասարկում։',
      shortDescription: 'Պրոֆեսիոնալ կայքի ստեղծում',
      price: 150000,
      priceType: 'FIXED',
      duration: '2-3 շաբաթ',
      isActive: true,
    },
  });

  const service2 = await prisma.service.upsert({
    where: { slug: 'ui-ux-design' },
    update: {},
    create: {
      companyId: company.id,
      categoryId: categories[1].id,
      title: 'UI/UX Դիզայն',
      slug: 'ui-ux-design',
      description: 'Ինտուիտիվ և գեղեցիկ ինտերֆեյսի մշակում Figma-ով։ Ներառում է wireframes, prototype, design system։',
      shortDescription: 'Պրոֆեսիոնալ UI/UX դիզայն',
      price: 80000,
      priceType: 'FIXED',
      duration: '1-2 շաբաթ',
      isActive: true,
    },
  });

  // Demo client
  const clientHash = await bcrypt.hash('Client123!', 12);
  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientHash,
      role: 'CLIENT',
      isVerified: true,
      profile: { create: { firstName: 'Narek', lastName: 'Petrosyan' } },
    },
  });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@tina.com / Admin123456!');
  console.log('Company: company@example.com / Company123!');
  console.log('Client: client@example.com / Client123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import categoriesRouter from './modules/categories/categories.router';
import companiesRouter from './modules/companies/companies.router';
import servicesRouter from './modules/services/services.router';
import packagesRouter from './modules/packages/packages.router';
import cartRouter from './modules/cart/cart.router';
import ordersRouter from './modules/orders/orders.router';
import reviewsRouter from './modules/reviews/reviews.router';
import notificationsRouter from './modules/notifications/notifications.router';
import adminRouter from './modules/admin/admin.router';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', env.FRONTEND_URL],
    credentials: true,
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(globalLimiter);

  app.get('/', (req, res) => res.json({ name: 'Tina Marketplace API', version: '1.0.0' }));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/companies', companiesRouter);
  app.use('/api/v1/services', servicesRouter);
  app.use('/api/v1/packages', packagesRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/orders', ordersRouter);
  app.use('/api/v1/reviews', reviewsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/admin', adminRouter);

  app.use(errorHandler);

  return app;
}

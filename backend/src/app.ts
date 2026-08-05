import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/routes';
import usersRoutes from './users/routes';
import categoriesRoutes from './categories/routes';
import productsRoutes from './products/routes';
import transactionsRoutes from './transactions/routes';
import reportsRoutes from './reports/routes';
import reportRecipientRoutes from './report-recipients/routes';
import settingsRoutes from './settings/routes';
import healthRoutes from './health/routes';
import analyticsRoutes from './analytics/routes';
import { errorMiddleware } from './middleware/error';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/', healthRoutes);

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/categories', categoriesRoutes);
app.use('/products', productsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/reports', reportsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/report-recipients', reportRecipientRoutes);
app.use('/api/v1/report-recipients', reportRecipientRoutes);
app.use('/settings', settingsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);


// Error Handling
app.use(errorMiddleware);

export default app;

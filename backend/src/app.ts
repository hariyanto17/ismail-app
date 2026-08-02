import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/routes';
import usersRoutes from './users/routes';
import categoriesRoutes from './categories/routes';
import productsRoutes from './products/routes';
import transactionsRoutes from './transactions/routes';
import { errorMiddleware } from './middleware/error';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/categories', categoriesRoutes);
app.use('/products', productsRoutes);
app.use('/transactions', transactionsRoutes);

// Error Handling
app.use(errorMiddleware);

export default app;

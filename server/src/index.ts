import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import weddingRoutes from './routes/wedding';
import guestRoutes from './routes/guests';
import vendorRoutes from './routes/vendors';
import taskRoutes from './routes/tasks';
import expenseRoutes from './routes/expenses';
import tableRoutes from './routes/tables';
import moodRoutes from './routes/mood';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static file serving for uploads ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wedding', weddingRoutes);
app.use('/api/v1/guests', guestRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/mood', moodRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Wedding Planner API running on http://localhost:${PORT}`);
});

export default app;

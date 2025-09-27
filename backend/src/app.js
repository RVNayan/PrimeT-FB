import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import taskRoutes from './routes/task.routes.js';
import adminTaskRoutes from './routes/admin/task.routes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware (MUST be before route mounts)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Optional debug middleware — remove in production
app.use((req, res, next) => {
  // only log small bodies to avoid noise
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('DEBUG body at global middleware:', req.path, req.body);
  }
  next();
});

// Logging
app.use(morgan('combined'));

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes (registered after body parser)
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminTaskRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling & 404 (error handler should be before 404 so it can format errors)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

export default app;

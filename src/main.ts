import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import { errorMiddleware, notFoundMiddleware } from './interfaces/http/middleware/ErrorMiddleware';
import { logger } from './infrastructure/logging/Logger';
import { initializeDatabase } from './infrastructure/persistence/config/data-source';

// Routes
import catalogRoutes from './interfaces/http/routes/catalog.routes';
import serviceRoutes from './interfaces/http/routes/service.routes';
import configurationRoutes from './interfaces/http/routes/configuration.routes';
import secretRoutes from './interfaces/http/routes/secret.routes';
import featureFlagRoutes from './interfaces/http/routes/feature-flag.routes';
import publicRoutes from './interfaces/http/routes/public.routes';
import healthRoutes from './interfaces/http/routes/health.routes';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/catalogs', catalogRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/configurations', configurationRoutes);
app.use('/api/v1/secrets', secretRoutes);
app.use('/api/v1/feature-flags', featureFlagRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/health', healthRoutes);

// Swagger documentation (if swagger.yaml exists)
try {
  const swaggerPath = path.join(__dirname, '../swagger.yaml');
  if (fs.existsSync(swaggerPath)) {
    // Try to use yamljs if available
    let swaggerDocument;
    try {
      const YAML = require('yamljs');
      swaggerDocument = YAML.load(swaggerPath);
    } catch (yamlError) {
      // Fallback: serve swagger.yaml as raw file
      app.use('/api-docs/swagger.yaml', express.static(swaggerPath));
      logger.info('Serving swagger.yaml as static file (yamljs not installed)');
    }
    
    if (swaggerDocument) {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } else {
      app.use('/api-docs', (req, res) => {
        res.json({ 
          message: 'Swagger UI not available',
          swaggerYaml: '/api-docs/swagger.yaml'
        });
      });
    }
  } else {
    logger.warn('swagger.yaml not found');
  }
} catch (error) {
  logger.warn('Swagger documentation not available:', error);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'mssistemas',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Microservicio de Catálogo y Configuración Centralizada',
    endpoints: {
      catalogs: '/api/v1/catalogs',
      services: '/api/v1/services',
      configurations: '/api/v1/configurations',
      secrets: '/api/v1/secrets',
      featureFlags: '/api/v1/feature-flags',
      health: '/api/v1/health',
    },
  });
});

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Initialize database and start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🚀 mssistemas running on port ${PORT}`);
      console.log(`🚀 mssistemas running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

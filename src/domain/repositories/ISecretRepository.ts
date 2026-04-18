import { Secret } from '@domain/entities/Secret';

export interface ISecretRepository {
  findAll(filters?: {
    serviceId?: string | null;
    environment?: string | null;
  }): Promise<Secret[]>;
  findById(id: string): Promise<Secret | null>;
  findByKey(key: string, serviceId?: string | null, environment?: string | null): Promise<Secret | null>;
  create(secret: Secret): Promise<Secret>;
  update(secret: Secret): Promise<Secret>;
  delete(id: string): Promise<void>;
  findAccessLogs(secretId: string): Promise<SecretAccessLog[]>;
}

export interface SecretAccessLog {
  id: string;
  secretId: string;
  serviceId: string | null;
  action: 'read' | 'write' | 'rotate';
  accessedBy: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

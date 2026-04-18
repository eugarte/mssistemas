import { AuditLog } from '@domain/entities/AuditLog';

export interface IAuditLogRepository {
  findAll(limit?: number): Promise<AuditLog[]>;
  findById(id: string): Promise<AuditLog | null>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByActor(actor: string): Promise<AuditLog[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;
  save(auditLog: AuditLog): Promise<AuditLog>;
  deleteOld(olderThanDays: number): Promise<number>;
}

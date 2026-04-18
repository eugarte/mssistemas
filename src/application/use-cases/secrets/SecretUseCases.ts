import { ISecretRepository } from '@domain/repositories/ISecretRepository';
import { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Secret, SecretAccessLog } from '@domain/entities/Secret';
import { AuditLog, AuditEntityType, AuditActorType } from '@domain/entities/AuditLog';
import { AesEncryptionService } from '@infrastructure/encryption/AesEncryptionService';
import { 
  CreateSecretDto, 
  UpdateSecretDto, 
  SecretResponseDto,
  SecretWithValueResponseDto,
  SecretAccessLogResponseDto 
} from '@application/dtos/SecretDto';

export class CreateSecretUseCase {
  constructor(
    private repository: ISecretRepository,
    private encryptionService: AesEncryptionService,
    private auditRepository: IAuditLogRepository
  ) {}

  async execute(dto: CreateSecretDto, userId?: string, ipAddress?: string): Promise<SecretResponseDto> {
    const encrypted = this.encryptionService.encryptToString(dto.value);

    const secret = new Secret({
      serviceId: dto.serviceId,
      environment: dto.environment,
      key: dto.key,
      encryptedValue: encrypted,
      encryptionVersion: 'v1',
      expiresAt: dto.expiresAt,
      createdBy: userId,
    });

    const saved = await this.repository.save(secret);

    // Log creation
    await this.auditRepository.save(new AuditLog({
      entityType: AuditEntityType.SECRET,
      entityId: saved.id,
      action: 'created',
      actor: userId,
      actorType: AuditActorType.USER,
      ipAddress,
      details: { key: saved.key, serviceId: saved.serviceId },
    }));

    return this.toResponseDto(saved);
  }

  private toResponseDto(secret: Secret): SecretResponseDto {
    return {
      id: secret.id,
      key: secret.key,
      serviceId: secret.serviceId,
      environment: secret.environment,
      encryptionVersion: secret.encryptionVersion,
      isRotating: secret.isRotating,
      lastRotatedAt: secret.lastRotatedAt,
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}

export class GetSecretsUseCase {
  constructor(private repository: ISecretRepository) {}

  async execute(): Promise<SecretResponseDto[]> {
    const secrets = await this.repository.findAll();
    return secrets.map(s => this.toResponseDto(s));
  }

  async executeById(id: string): Promise<SecretResponseDto | null> {
    const secret = await this.repository.findById(id);
    return secret ? this.toResponseDto(secret) : null;
  }

  async executeByService(serviceId?: string): Promise<SecretResponseDto[]> {
    const secrets = await this.repository.findByService(serviceId);
    return secrets.map(s => this.toResponseDto(s));
  }

  private toResponseDto(secret: Secret): SecretResponseDto {
    return {
      id: secret.id,
      key: secret.key,
      serviceId: secret.serviceId,
      environment: secret.environment,
      encryptionVersion: secret.encryptionVersion,
      isRotating: secret.isRotating,
      lastRotatedAt: secret.lastRotatedAt,
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}

export class GetSecretValueUseCase {
  constructor(
    private repository: ISecretRepository,
    private encryptionService: AesEncryptionService,
    private auditRepository: IAuditLogRepository
  ) {}

  async execute(
    id: string, 
    userId?: string, 
    serviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<SecretWithValueResponseDto | null> {
    const secret = await this.repository.findById(id);
    if (!secret) return null;

    // Decrypt
    let decryptedValue: string;
    try {
      decryptedValue = this.encryptionService.decryptFromString(secret.encryptedValue);
    } catch (error) {
      throw new Error('Failed to decrypt secret');
    }

    // Log access
    await this.repository.logAccess(new SecretAccessLog({
      secretId: id,
      serviceId,
      action: 'read',
      accessedBy: userId,
      ipAddress,
      userAgent,
    }));

    await this.auditRepository.save(new AuditLog({
      entityType: AuditEntityType.SECRET,
      entityId: id,
      action: 'read',
      actor: userId,
      actorType: userId ? AuditActorType.USER : AuditActorType.SERVICE,
      ipAddress,
      details: { key: secret.key },
    }));

    return {
      ...this.toResponseDto(secret),
      value: decryptedValue,
    };
  }

  private toResponseDto(secret: Secret): SecretResponseDto {
    return {
      id: secret.id,
      key: secret.key,
      serviceId: secret.serviceId,
      environment: secret.environment,
      encryptionVersion: secret.encryptionVersion,
      isRotating: secret.isRotating,
      lastRotatedAt: secret.lastRotatedAt,
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}

export class UpdateSecretUseCase {
  constructor(
    private repository: ISecretRepository,
    private encryptionService: AesEncryptionService,
    private auditRepository: IAuditLogRepository
  ) {}

  async execute(
    id: string, 
    dto: UpdateSecretDto, 
    userId?: string,
    ipAddress?: string
  ): Promise<SecretResponseDto | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    let encryptedValue: string | undefined;
    if (dto.value) {
      encryptedValue = this.encryptionService.encryptToString(dto.value);
    }

    const updated = await this.repository.update(id, {
      encryptedValue,
      expiresAt: dto.expiresAt,
    });

    if (updated) {
      await this.repository.logAccess(new SecretAccessLog({
        secretId: id,
        action: 'write',
        accessedBy: userId,
        ipAddress,
      }));

      await this.auditRepository.save(new AuditLog({
        entityType: AuditEntityType.SECRET,
        entityId: id,
        action: 'updated',
        actor: userId,
        actorType: AuditActorType.USER,
        ipAddress,
        details: { key: updated.key },
      }));
    }

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(secret: Secret): SecretResponseDto {
    return {
      id: secret.id,
      key: secret.key,
      serviceId: secret.serviceId,
      environment: secret.environment,
      encryptionVersion: secret.encryptionVersion,
      isRotating: secret.isRotating,
      lastRotatedAt: secret.lastRotatedAt,
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}

export class RotateSecretUseCase {
  constructor(
    private repository: ISecretRepository,
    private encryptionService: AesEncryptionService,
    private auditRepository: IAuditLogRepository
  ) {}

  async execute(
    id: string, 
    newValue: string, 
    userId?: string,
    ipAddress?: string
  ): Promise<SecretResponseDto | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const encryptedValue = this.encryptionService.encryptToString(newValue);

    const updated = await this.repository.update(id, {
      encryptedValue,
    });

    if (updated) {
      await this.repository.logAccess(new SecretAccessLog({
        secretId: id,
        action: 'rotate',
        accessedBy: userId,
        ipAddress,
      }));

      await this.auditRepository.save(new AuditLog({
        entityType: AuditEntityType.SECRET,
        entityId: id,
        action: 'rotated',
        actor: userId,
        actorType: AuditActorType.USER,
        ipAddress,
        details: { key: updated.key },
      }));
    }

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(secret: Secret): SecretResponseDto {
    return {
      id: secret.id,
      key: secret.key,
      serviceId: secret.serviceId,
      environment: secret.environment,
      encryptionVersion: secret.encryptionVersion,
      isRotating: secret.isRotating,
      lastRotatedAt: secret.lastRotatedAt,
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}

export class DeleteSecretUseCase {
  constructor(
    private repository: ISecretRepository,
    private auditRepository: IAuditLogRepository
  ) {}

  async execute(id: string, userId?: string, ipAddress?: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) return false;

    const result = await this.repository.delete(id);

    if (result) {
      await this.auditRepository.save(new AuditLog({
        entityType: AuditEntityType.SECRET,
        entityId: id,
        action: 'deleted',
        actor: userId,
        actorType: AuditActorType.USER,
        ipAddress,
        details: { key: existing.key },
      }));
    }

    return result;
  }
}

export class GetSecretAccessLogsUseCase {
  constructor(private repository: ISecretRepository) {}

  async execute(secretId: string, limit: number = 100): Promise<SecretAccessLogResponseDto[]> {
    const logs = await this.repository.getAccessLogs(secretId, limit);
    return logs.map(l => this.toResponseDto(l));
  }

  private toResponseDto(log: SecretAccessLog): SecretAccessLogResponseDto {
    return {
      id: log.id,
      action: log.action,
      accessedBy: log.accessedBy,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    };
  }
}

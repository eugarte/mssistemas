import { ISecretRepository, SecretAccessLog } from '@domain/repositories/ISecretRepository';
import { Secret } from '@domain/entities/Secret';
import { IEncryptionService } from '@infrastructure/encryption/IEncryptionService';

export interface GetSecretDTO {
  id?: string;
  key?: string;
  serviceId?: string | null;
  environment?: string | null;
}

export interface GetSecretResult {
  secret: Secret;
  decryptedValue: string;
}

export class GetSecretUseCase {
  constructor(
    private readonly secretRepository: ISecretRepository,
    private readonly encryptionService: IEncryptionService
  ) {}

  async execute(
    dto: GetSecretDTO,
    accessedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<GetSecretResult> {
    let secret: Secret | null;

    if (dto.id) {
      secret = await this.secretRepository.findById(dto.id);
    } else if (dto.key) {
      secret = await this.secretRepository.findByKey(
        dto.key,
        dto.serviceId || null,
        dto.environment || null
      );
    } else {
      throw new Error('Either id or key must be provided');
    }

    if (!secret) {
      throw new Error('Secret not found');
    }

    if (secret.isExpired()) {
      throw new Error('Secret has expired');
    }

    // Decrypt the value
    const decryptedValue = this.encryptionService.decrypt(secret.encryptedValue);

    // Log access (would be done via audit service in real implementation)
    // This is simplified for the use case

    return { secret, decryptedValue };
  }
}

export class GetSecretMetadataUseCase {
  constructor(private readonly secretRepository: ISecretRepository) {}

  async execute(filters?: {
    serviceId?: string | null;
    environment?: string | null;
  }): Promise<Secret[]> {
    return this.secretRepository.findAll(filters);
  }
}

export class GetSecretByIdUseCase {
  constructor(private readonly secretRepository: ISecretRepository) {}

  async execute(id: string): Promise<Secret | null> {
    return this.secretRepository.findById(id);
  }
}

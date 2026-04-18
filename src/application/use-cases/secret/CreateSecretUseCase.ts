import { Secret } from '@domain/entities/Secret';
import { ISecretRepository } from '@domain/repositories/ISecretRepository';
import { IEncryptionService } from '@infrastructure/encryption/IEncryptionService';

export interface CreateSecretDTO {
  key: string;
  value: string;
  serviceId?: string | null;
  environment?: string | null;
  expiresAt?: Date | null;
}

export class CreateSecretUseCase {
  constructor(
    private readonly secretRepository: ISecretRepository,
    private readonly encryptionService: IEncryptionService
  ) {}

  async execute(dto: CreateSecretDTO, createdBy: string = 'system'): Promise<Secret> {
    // Check if secret already exists
    const existing = await this.secretRepository.findByKey(
      dto.key,
      dto.serviceId || null,
      dto.environment || null
    );
    if (existing) {
      throw new Error(`Secret with key '${dto.key}' already exists for this service/environment`);
    }

    // Encrypt the value
    const encryptedValue = this.encryptionService.encrypt(dto.value);

    const secret = new Secret(
      dto.key,
      encryptedValue,
      'v1',
      dto.serviceId || null,
      dto.environment || null,
      dto.expiresAt || null,
      createdBy
    );

    return this.secretRepository.create(secret);
  }
}

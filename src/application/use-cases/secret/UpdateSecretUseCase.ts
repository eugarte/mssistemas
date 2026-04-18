import { ISecretRepository } from '@domain/repositories/ISecretRepository';
import { Secret } from '@domain/entities/Secret';
import { IEncryptionService } from '@infrastructure/encryption/IEncryptionService';

export interface UpdateSecretDTO {
  value?: string;
  expiresAt?: Date | null;
}

export class UpdateSecretUseCase {
  constructor(
    private readonly secretRepository: ISecretRepository,
    private readonly encryptionService: IEncryptionService
  ) {}

  async execute(id: string, dto: UpdateSecretDTO): Promise<Secret> {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new Error(`Secret with id '${id}' not found`);
    }

    if (dto.value !== undefined) {
      const encryptedValue = this.encryptionService.encrypt(dto.value);
      secret.encryptedValue = encryptedValue;
      secret.updatedAt = new Date();
    }

    if (dto.expiresAt !== undefined) {
      secret.expiresAt = dto.expiresAt;
      secret.updatedAt = new Date();
    }

    return this.secretRepository.update(secret);
  }
}

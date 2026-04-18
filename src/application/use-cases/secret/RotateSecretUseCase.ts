import { ISecretRepository, SecretAccessLog } from '@domain/repositories/ISecretRepository';
import { IEncryptionService } from '@infrastructure/encryption/IEncryptionService';

export class RotateSecretUseCase {
  constructor(
    private readonly secretRepository: ISecretRepository,
    private readonly encryptionService: IEncryptionService
  ) {}

  async execute(id: string, newValue: string): Promise<void> {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new Error(`Secret with id '${id}' not found`);
    }

    const encryptedValue = this.encryptionService.encrypt(newValue);
    secret.rotate(encryptedValue);

    await this.secretRepository.update(secret);
  }
}

export class GetSecretAccessLogsUseCase {
  constructor(private readonly secretRepository: ISecretRepository) {}

  async execute(secretId: string): Promise<SecretAccessLog[]> {
    return this.secretRepository.findAccessLogs(secretId);
  }
}

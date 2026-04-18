import { ISecretRepository } from '@domain/repositories/ISecretRepository';

export class DeleteSecretUseCase {
  constructor(private readonly secretRepository: ISecretRepository) {}

  async execute(id: string): Promise<void> {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new Error(`Secret with id '${id}' not found`);
    }

    return this.secretRepository.delete(id);
  }
}

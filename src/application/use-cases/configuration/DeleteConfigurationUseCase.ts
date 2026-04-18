import { IConfigurationRepository } from '@domain/repositories/IConfigurationRepository';

export class DeleteConfigurationUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(id: string, permanent: boolean = false): Promise<void> {
    const configuration = await this.configurationRepository.findById(id);
    if (!configuration) {
      throw new Error(`Configuration with id '${id}' not found`);
    }

    if (permanent) {
      return this.configurationRepository.delete(id);
    } else {
      return this.configurationRepository.softDelete(id);
    }
  }
}

import { IConfigurationRepository } from '@domain/repositories/IConfigurationRepository';
import { Configuration, ConfigurationType } from '@domain/entities/Configuration';

export interface UpdateConfigurationDTO {
  value?: string;
  type?: ConfigurationType;
  isSecret?: boolean;
  isEncrypted?: boolean;
  description?: string | null;
  tags?: string[];
}

export class UpdateConfigurationUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(id: string, dto: UpdateConfigurationDTO): Promise<Configuration> {
    const configuration = await this.configurationRepository.findById(id);
    if (!configuration) {
      throw new Error(`Configuration with id '${id}' not found`);
    }

    configuration.update(dto);
    return this.configurationRepository.update(configuration);
  }
}

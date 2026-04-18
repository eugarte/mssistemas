import { Configuration, ConfigurationType } from '@domain/entities/Configuration';
import { IConfigurationRepository } from '@domain/repositories/IConfigurationRepository';

export interface CreateConfigurationDTO {
  key: string;
  value: string;
  type?: ConfigurationType;
  serviceId?: string | null;
  environment?: string | null;
  isSecret?: boolean;
  isEncrypted?: boolean;
  description?: string;
  tags?: string[];
}

export class CreateConfigurationUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(dto: CreateConfigurationDTO, createdBy: string = 'system'): Promise<Configuration> {
    // Check if configuration already exists at this level
    const existing = await this.configurationRepository.findByKey(
      dto.key,
      dto.serviceId || null,
      dto.environment || null
    );
    if (existing) {
      throw new Error(`Configuration with key '${dto.key}' already exists for this service/environment`);
    }

    const configuration = new Configuration(
      dto.key,
      dto.value,
      dto.type || 'string',
      dto.serviceId || null,
      dto.environment || null,
      dto.isSecret || false,
      dto.isEncrypted || false,
      dto.description || null,
      dto.tags || [],
      createdBy
    );

    return this.configurationRepository.create(configuration);
  }
}

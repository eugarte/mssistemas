import { IConfigurationRepository } from '@domain/repositories/IConfigurationRepository';
import { Configuration } from '@domain/entities/Configuration';

export interface GetConfigurationsFilters {
  serviceId?: string | null;
  environment?: string | null;
  key?: string;
}

export class GetConfigurationsUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(filters?: GetConfigurationsFilters): Promise<Configuration[]> {
    return this.configurationRepository.findAll(filters);
  }
}

export class GetConfigurationByIdUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(id: string): Promise<Configuration | null> {
    return this.configurationRepository.findById(id);
  }
}

export interface GetConfigurationHierarchyResult {
  configuration: Configuration | null;
  source: 'service+environment' | 'service' | 'environment' | 'default' | null;
}

export class GetConfigurationHierarchyUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(
    key: string,
    serviceId?: string,
    environment?: string
  ): Promise<GetConfigurationHierarchyResult> {
    const config = await this.configurationRepository.findByHierarchy(key, serviceId, environment);
    
    if (!config) {
      return { configuration: null, source: null };
    }

    let source: GetConfigurationHierarchyResult['source'] = 'default';
    if (config.serviceId && config.environment) {
      source = 'service+environment';
    } else if (config.serviceId) {
      source = 'service';
    } else if (config.environment) {
      source = 'environment';
    }

    return { configuration: config, source };
  }
}

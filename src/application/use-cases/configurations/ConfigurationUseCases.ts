import { IConfigurationRepository } from '@domain/repositories/IConfigurationRepository';
import { Configuration, ConfigurationHistory, ConfigurationType } from '@domain/entities/Configuration';
import { 
  CreateConfigurationDto, 
  UpdateConfigurationDto, 
  ConfigurationResponseDto,
  ConfigurationHistoryResponseDto 
} from '@application/dtos/ConfigurationDto';

export class CreateConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(dto: CreateConfigurationDto, userId?: string): Promise<ConfigurationResponseDto> {
    const config = new Configuration({
      serviceId: dto.serviceId,
      environment: dto.environment,
      key: dto.key,
      value: dto.value,
      type: (dto.type as ConfigurationType) || ConfigurationType.STRING,
      isSecret: dto.isSecret || false,
      isEncrypted: false,
      description: dto.description,
      tags: dto.tags || [],
      createdBy: userId,
    });

    const saved = await this.repository.save(config);
    
    // Save history
    await this.repository.saveHistory(new ConfigurationHistory({
      configurationId: saved.id,
      action: 'created',
      newValue: saved.value,
      changedBy: userId,
    }));

    return this.toResponseDto(saved);
  }

  private toResponseDto(config: Configuration): ConfigurationResponseDto {
    return {
      id: config.id,
      key: config.key,
      value: config.value,
      type: config.type,
      serviceId: config.serviceId,
      environment: config.environment,
      description: config.description,
      tags: config.tags,
      isSecret: config.isSecret,
      isEncrypted: config.isEncrypted,
      version: config.version,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

export class GetConfigurationsUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(): Promise<ConfigurationResponseDto[]> {
    const configs = await this.repository.findAll();
    return configs.map(c => this.toResponseDto(c));
  }

  async executeById(id: string): Promise<ConfigurationResponseDto | null> {
    const config = await this.repository.findById(id);
    return config ? this.toResponseDto(config) : null;
  }

  async executeByService(serviceId?: string): Promise<ConfigurationResponseDto[]> {
    const configs = await this.repository.findByService(serviceId);
    return configs.map(c => this.toResponseDto(c));
  }

  async executeByEnvironment(environment?: string): Promise<ConfigurationResponseDto[]> {
    const configs = await this.repository.findByEnvironment(environment);
    return configs.map(c => this.toResponseDto(c));
  }

  async executeByServiceAndEnvironment(
    serviceId: string, 
    environment: string
  ): Promise<ConfigurationResponseDto[]> {
    const configs = await this.repository.findByServiceAndEnvironment(serviceId, environment);
    return configs.map(c => this.toResponseDto(c));
  }

  async executeMostSpecific(
    serviceId: string,
    environment: string,
    key: string
  ): Promise<ConfigurationResponseDto | null> {
    const config = await this.repository.findMostSpecific(serviceId, environment, key);
    return config ? this.toResponseDto(config) : null;
  }

  async search(query: string): Promise<ConfigurationResponseDto[]> {
    const configs = await this.repository.search(query);
    return configs.map(c => this.toResponseDto(c));
  }

  private toResponseDto(config: Configuration): ConfigurationResponseDto {
    return {
      id: config.id,
      key: config.key,
      value: config.value,
      type: config.type,
      serviceId: config.serviceId,
      environment: config.environment,
      description: config.description,
      tags: config.tags,
      isSecret: config.isSecret,
      isEncrypted: config.isEncrypted,
      version: config.version,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

export class UpdateConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(
    id: string, 
    dto: UpdateConfigurationDto, 
    userId?: string
  ): Promise<ConfigurationResponseDto | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const oldValue = existing.value;

    const updated = await this.repository.update(id, {
      value: dto.value,
      type: dto.type as ConfigurationType,
      description: dto.description,
      tags: dto.tags,
      version: existing.version + 1,
    });

    if (updated) {
      await this.repository.saveHistory(new ConfigurationHistory({
        configurationId: id,
        action: 'updated',
        oldValue,
        newValue: updated.value,
        changedBy: userId,
        changeReason: dto.changeReason,
      }));
    }

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(config: Configuration): ConfigurationResponseDto {
    return {
      id: config.id,
      key: config.key,
      value: config.value,
      type: config.type,
      serviceId: config.serviceId,
      environment: config.environment,
      description: config.description,
      tags: config.tags,
      isSecret: config.isSecret,
      isEncrypted: config.isEncrypted,
      version: config.version,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

export class DeleteConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(id: string, userId?: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) return false;

    await this.repository.saveHistory(new ConfigurationHistory({
      configurationId: id,
      action: 'deleted',
      oldValue: existing.value,
      changedBy: userId,
    }));

    return this.repository.softDelete(id);
  }
}

export class GetConfigurationHistoryUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(configurationId: string): Promise<ConfigurationHistoryResponseDto[]> {
    const history = await this.repository.getHistory(configurationId);
    return history.map(h => this.toHistoryResponseDto(h));
  }

  private toHistoryResponseDto(history: ConfigurationHistory): ConfigurationHistoryResponseDto {
    return {
      id: history.id,
      action: history.action,
      oldValue: history.oldValue,
      newValue: history.newValue,
      changedBy: history.changedBy,
      changeReason: history.changeReason,
      createdAt: history.createdAt,
    };
  }
}

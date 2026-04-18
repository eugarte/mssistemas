import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';
import { FeatureFlag, FeatureFlagServiceOverride } from '@domain/entities/FeatureFlag';
import { 
  CreateFeatureFlagDto, 
  UpdateFeatureFlagDto, 
  EvaluateFeatureFlagDto,
  FeatureFlagServiceOverrideDto,
  FeatureFlagResponseDto,
  FeatureFlagEvaluationResponseDto 
} from '@application/dtos/FeatureFlagDto';

export class CreateFeatureFlagUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(dto: CreateFeatureFlagDto, userId?: string): Promise<FeatureFlagResponseDto> {
    const flag = new FeatureFlag({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      enabled: dto.enabled || false,
      strategy: dto.strategy || 'simple',
      percentage: dto.percentage || 0,
      targetUsers: dto.targetUsers || [],
      targetGroups: dto.targetGroups || [],
      scheduleStart: dto.scheduleStart,
      scheduleEnd: dto.scheduleEnd,
      createdBy: userId,
    });

    const saved = await this.repository.save(flag);
    return this.toResponseDto(saved);
  }

  private toResponseDto(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      strategy: flag.strategy,
      percentage: flag.percentage,
      targetUsers: flag.targetUsers,
      targetGroups: flag.targetGroups,
      scheduleStart: flag.scheduleStart,
      scheduleEnd: flag.scheduleEnd,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}

export class GetFeatureFlagsUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(): Promise<FeatureFlagResponseDto[]> {
    const flags = await this.repository.findAll();
    return flags.map(f => this.toResponseDto(f));
  }

  async executeById(id: string): Promise<FeatureFlagResponseDto | null> {
    const flag = await this.repository.findById(id);
    return flag ? this.toResponseDto(flag) : null;
  }

  async executeByKey(key: string): Promise<FeatureFlagResponseDto | null> {
    const flag = await this.repository.findByKey(key);
    return flag ? this.toResponseDto(flag) : null;
  }

  async executeEnabled(): Promise<FeatureFlagResponseDto[]> {
    const flags = await this.repository.findEnabled();
    return flags.map(f => this.toResponseDto(f));
  }

  private toResponseDto(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      strategy: flag.strategy,
      percentage: flag.percentage,
      targetUsers: flag.targetUsers,
      targetGroups: flag.targetGroups,
      scheduleStart: flag.scheduleStart,
      scheduleEnd: flag.scheduleEnd,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}

export class UpdateFeatureFlagUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(id: string, dto: UpdateFeatureFlagDto): Promise<FeatureFlagResponseDto | null> {
    const updated = await this.repository.update(id, {
      name: dto.name,
      description: dto.description,
      enabled: dto.enabled,
      strategy: dto.strategy,
      percentage: dto.percentage,
      targetUsers: dto.targetUsers,
      targetGroups: dto.targetGroups,
      scheduleStart: dto.scheduleStart,
      scheduleEnd: dto.scheduleEnd,
    });

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      strategy: flag.strategy,
      percentage: flag.percentage,
      targetUsers: flag.targetUsers,
      targetGroups: flag.targetGroups,
      scheduleStart: flag.scheduleStart,
      scheduleEnd: flag.scheduleEnd,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}

export class ToggleFeatureFlagUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(id: string): Promise<FeatureFlagResponseDto | null> {
    const toggled = await this.repository.toggle(id);
    return toggled ? this.toResponseDto(toggled) : null;
  }

  private toResponseDto(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      strategy: flag.strategy,
      percentage: flag.percentage,
      targetUsers: flag.targetUsers,
      targetGroups: flag.targetGroups,
      scheduleStart: flag.scheduleStart,
      scheduleEnd: flag.scheduleEnd,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}

export class DeleteFeatureFlagUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export class EvaluateFeatureFlagUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(
    key: string, 
    dto: EvaluateFeatureFlagDto
  ): Promise<FeatureFlagEvaluationResponseDto> {
    const flag = await this.repository.findByKey(key);
    
    if (!flag) {
      return {
        key,
        enabled: false,
        reason: 'Flag not found',
      };
    }

    // Check for service override
    if (dto.serviceId) {
      const override = flag.getServiceOverride(dto.serviceId);
      if (override && !override.isEnabled) {
        return {
          key,
          enabled: false,
          reason: 'Disabled by service override',
        };
      }
    }

    const enabled = flag.evaluate(dto.userId, dto.userGroups);
    
    return {
      key,
      enabled,
      reason: enabled ? 'Flag is enabled' : 'Flag is disabled',
    };
  }
}

export class AddFeatureFlagServiceOverrideUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(
    featureFlagId: string, 
    dto: FeatureFlagServiceOverrideDto
  ): Promise<FeatureFlagServiceOverride> {
    const override = new FeatureFlagServiceOverride({
      featureFlagId,
      serviceId: dto.serviceId,
      isEnabled: dto.isEnabled,
      overrideStrategy: dto.overrideStrategy,
    });

    return this.repository.saveServiceOverride(override);
  }
}

export class RemoveFeatureFlagServiceOverrideUseCase {
  constructor(private repository: IFeatureFlagRepository) {}

  async execute(featureFlagId: string, serviceId: string): Promise<boolean> {
    const override = await this.repository.findServiceOverride(featureFlagId, serviceId);
    if (!override) return false;
    
    return this.repository.deleteServiceOverride(override.id);
  }
}

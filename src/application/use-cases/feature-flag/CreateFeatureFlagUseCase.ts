import { FeatureFlag, FeatureFlagStrategy } from '@domain/entities/FeatureFlag';
import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';

export interface CreateFeatureFlagDTO {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  strategy?: FeatureFlagStrategy;
  percentage?: number | null;
  targetUsers?: string[];
  targetGroups?: string[];
  scheduleStart?: Date | null;
  scheduleEnd?: Date | null;
}

export class CreateFeatureFlagUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(dto: CreateFeatureFlagDTO, createdBy: string = 'system'): Promise<FeatureFlag> {
    // Check if key already exists
    const existing = await this.featureFlagRepository.findByKey(dto.key);
    if (existing) {
      throw new Error(`Feature flag with key '${dto.key}' already exists`);
    }

    const featureFlag = new FeatureFlag(
      dto.key,
      dto.name,
      dto.description || null,
      dto.enabled || false,
      dto.strategy || 'simple',
      dto.percentage || null,
      dto.targetUsers || [],
      dto.targetGroups || [],
      dto.scheduleStart || null,
      dto.scheduleEnd || null,
      createdBy
    );

    return this.featureFlagRepository.create(featureFlag);
  }
}

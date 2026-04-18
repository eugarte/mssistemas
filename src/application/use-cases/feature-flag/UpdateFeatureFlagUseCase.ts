import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';
import { FeatureFlag, FeatureFlagStrategy } from '@domain/entities/FeatureFlag';

export interface UpdateFeatureFlagDTO {
  name?: string;
  description?: string | null;
  enabled?: boolean;
  strategy?: FeatureFlagStrategy;
  percentage?: number | null;
  targetUsers?: string[];
  targetGroups?: string[];
  scheduleStart?: Date | null;
  scheduleEnd?: Date | null;
}

export class UpdateFeatureFlagUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(id: string, dto: UpdateFeatureFlagDTO): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagRepository.findById(id);
    if (!featureFlag) {
      throw new Error(`Feature flag with id '${id}' not found`);
    }

    featureFlag.update(dto);
    return this.featureFlagRepository.update(featureFlag);
  }
}

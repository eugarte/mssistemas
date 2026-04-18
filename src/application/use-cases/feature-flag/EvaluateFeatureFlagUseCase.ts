import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';
import { FeatureFlag } from '@domain/entities/FeatureFlag';

export interface EvaluateFeatureFlagDTO {
  key: string;
  userId?: string;
  userGroups?: string[];
}

export class EvaluateFeatureFlagUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(dto: EvaluateFeatureFlagDTO): Promise<boolean> {
    const featureFlag = await this.featureFlagRepository.findByKey(dto.key);
    if (!featureFlag) {
      // Feature flag doesn't exist, default to false
      return false;
    }

    return featureFlag.evaluate(dto.userId, dto.userGroups);
  }
}

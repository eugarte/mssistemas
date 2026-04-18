import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';
import { FeatureFlag } from '@domain/entities/FeatureFlag';

export class ToggleFeatureFlagUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(id: string): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagRepository.findById(id);
    if (!featureFlag) {
      throw new Error(`Feature flag with id '${id}' not found`);
    }

    featureFlag.toggle();
    return this.featureFlagRepository.update(featureFlag);
  }
}

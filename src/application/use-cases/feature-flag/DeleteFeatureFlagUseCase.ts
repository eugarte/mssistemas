import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';

export class DeleteFeatureFlagUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(id: string): Promise<void> {
    const featureFlag = await this.featureFlagRepository.findById(id);
    if (!featureFlag) {
      throw new Error(`Feature flag with id '${id}' not found`);
    }

    return this.featureFlagRepository.delete(id);
  }
}

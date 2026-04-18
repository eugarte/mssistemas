import { IFeatureFlagRepository } from '@domain/repositories/IFeatureFlagRepository';
import { FeatureFlag } from '@domain/entities/FeatureFlag';

export class GetAllFeatureFlagsUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.findAll();
  }
}

export class GetFeatureFlagByIdUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(id: string): Promise<FeatureFlag | null> {
    return this.featureFlagRepository.findById(id);
  }
}

export class GetFeatureFlagByKeyUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(key: string): Promise<FeatureFlag | null> {
    return this.featureFlagRepository.findByKey(key);
  }
}

export class GetFeatureFlagsByServiceUseCase {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(serviceId: string): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.findByServiceId(serviceId);
  }
}

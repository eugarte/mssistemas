import { FeatureFlag } from '@domain/entities/FeatureFlag';

export interface IFeatureFlagRepository {
  findAll(): Promise<FeatureFlag[]>;
  findById(id: string): Promise<FeatureFlag | null>;
  findByKey(key: string): Promise<FeatureFlag | null>;
  create(featureFlag: FeatureFlag): Promise<FeatureFlag>;
  update(featureFlag: FeatureFlag): Promise<FeatureFlag>;
  delete(id: string): Promise<void>;
  findByServiceId(serviceId: string): Promise<FeatureFlag[]>;
}

export interface FeatureFlagServiceAssignment {
  id: string;
  featureFlagId: string;
  serviceId: string;
  isEnabled: boolean;
  overrideStrategy: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

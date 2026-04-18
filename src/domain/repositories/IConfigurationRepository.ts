import { Configuration } from '@domain/entities/Configuration';

export interface IConfigurationRepository {
  findAll(filters?: {
    serviceId?: string | null;
    environment?: string | null;
    key?: string;
  }): Promise<Configuration[]>;
  findById(id: string): Promise<Configuration | null>;
  findByKey(key: string, serviceId?: string | null, environment?: string | null): Promise<Configuration | null>;
  findByHierarchy(key: string, serviceId?: string | null, environment?: string | null): Promise<Configuration | null>;
  create(configuration: Configuration): Promise<Configuration>;
  update(configuration: Configuration): Promise<Configuration>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  findHistory(configurationId: string): Promise<ConfigurationHistory[]>;
}

export interface ConfigurationHistory {
  id: string;
  configurationId: string;
  action: 'created' | 'updated' | 'deleted';
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changeReason: string | null;
  createdAt: Date;
}

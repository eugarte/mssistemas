import { IConfigurationRepository, ConfigurationHistory } from '@domain/repositories/IConfigurationRepository';

export class GetConfigurationHistoryUseCase {
  constructor(private readonly configurationRepository: IConfigurationRepository) {}

  async execute(configurationId: string): Promise<ConfigurationHistory[]> {
    return this.configurationRepository.findHistory(configurationId);
  }
}

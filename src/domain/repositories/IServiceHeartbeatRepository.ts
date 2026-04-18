import { ServiceHeartbeat } from '@domain/entities/ServiceHeartbeat';

export interface IServiceHeartbeatRepository {
  findAll(filters?: {
    serviceId?: string;
    environment?: string;
  }): Promise<ServiceHeartbeat[]>;
  findById(id: string): Promise<ServiceHeartbeat | null>;
  findLatestByService(serviceId: string, environment: string): Promise<ServiceHeartbeat | null>;
  create(heartbeat: ServiceHeartbeat): Promise<ServiceHeartbeat>;
  findStale(thresholdMinutes: number): Promise<ServiceHeartbeat[]>;
}

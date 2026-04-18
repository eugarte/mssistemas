import { Service } from '@domain/entities/Service';

export interface IServiceRepository {
  findAll(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service | null>;
  create(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
}

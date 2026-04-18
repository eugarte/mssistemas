import { v4 as uuidv4 } from 'uuid';

export type ConfigurationType = 'string' | 'number' | 'boolean' | 'json' | 'yaml';

export class Configuration {
  public readonly id: string;
  public serviceId: string | null;
  public environment: string | null;
  public key: string;
  public value: string;
  public type: ConfigurationType;
  public isSecret: boolean;
  public isEncrypted: boolean;
  public version: number;
  public description: string | null;
  public tags: string[];
  public deletedAt: Date | null;
  public createdBy: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    key: string,
    value: string,
    type: ConfigurationType = 'string',
    serviceId: string | null = null,
    environment: string | null = null,
    isSecret: boolean = false,
    isEncrypted: boolean = false,
    description: string | null = null,
    tags: string[] = [],
    createdBy: string = 'system',
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null
  ) {
    this.id = id || uuidv4();
    this.serviceId = serviceId;
    this.environment = environment;
    this.key = key;
    this.value = value;
    this.type = type;
    this.isSecret = isSecret;
    this.isEncrypted = isEncrypted;
    this.version = 1;
    this.description = description;
    this.tags = tags;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.deletedAt = deletedAt || null;
  }

  public update(data: Partial<Pick<Configuration, 'value' | 'type' | 'isSecret' | 'isEncrypted' | 'description' | 'tags'>>): void {
    if (data.value !== undefined) {
      this.value = data.value;
      this.version++;
    }
    if (data.type !== undefined) this.type = data.type;
    if (data.isSecret !== undefined) this.isSecret = data.isSecret;
    if (data.isEncrypted !== undefined) this.isEncrypted = data.isEncrypted;
    if (data.description !== undefined) this.description = data.description;
    if (data.tags !== undefined) this.tags = data.tags;
    this.updatedAt = new Date();
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public getParsedValue(): any {
    switch (this.type) {
      case 'number':
        return Number(this.value);
      case 'boolean':
        return this.value.toLowerCase() === 'true' || this.value === '1';
      case 'json':
        try {
          return JSON.parse(this.value);
        } catch {
          return this.value;
        }
      case 'yaml':
        // YAML parsing would require a library like js-yaml
        return this.value;
      default:
        return this.value;
    }
  }
}

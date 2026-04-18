import { v4 as uuidv4 } from 'uuid';

export interface ServiceEndpoint {
  environment: string;
  baseUrl: string;
  healthCheckPath: string;
  isActive: boolean;
}

export class Service {
  public readonly id: string;
  public name: string;
  public displayName: string;
  public description: string | null;
  public version: string;
  public statusCatalogId: string | null;
  public statusValue: string | null;
  public teamOwner: string | null;
  public repositoryUrl: string | null;
  public documentationUrl: string | null;
  public technologyStack: string[];
  public healthCheckUrl: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    displayName: string,
    description: string | null = null,
    version: string = '1.0.0',
    statusCatalogId: string | null = null,
    statusValue: string | null = null,
    teamOwner: string | null = null,
    repositoryUrl: string | null = null,
    documentationUrl: string | null = null,
    technologyStack: string[] = [],
    healthCheckUrl: string | null = null,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.version = version;
    this.statusCatalogId = statusCatalogId;
    this.statusValue = statusValue;
    this.teamOwner = teamOwner;
    this.repositoryUrl = repositoryUrl;
    this.documentationUrl = documentationUrl;
    this.technologyStack = technologyStack;
    this.healthCheckUrl = healthCheckUrl;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public update(data: Partial<Pick<Service, 'displayName' | 'description' | 'version' | 'statusCatalogId' | 'statusValue' | 'teamOwner' | 'repositoryUrl' | 'documentationUrl' | 'technologyStack' | 'healthCheckUrl'>>): void {
    if (data.displayName !== undefined) this.displayName = data.displayName;
    if (data.description !== undefined) this.description = data.description;
    if (data.version !== undefined) this.version = data.version;
    if (data.statusCatalogId !== undefined) this.statusCatalogId = data.statusCatalogId;
    if (data.statusValue !== undefined) this.statusValue = data.statusValue;
    if (data.teamOwner !== undefined) this.teamOwner = data.teamOwner;
    if (data.repositoryUrl !== undefined) this.repositoryUrl = data.repositoryUrl;
    if (data.documentationUrl !== undefined) this.documentationUrl = data.documentationUrl;
    if (data.technologyStack !== undefined) this.technologyStack = data.technologyStack;
    if (data.healthCheckUrl !== undefined) this.healthCheckUrl = data.healthCheckUrl;
    this.updatedAt = new Date();
  }
}

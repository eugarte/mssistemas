import { v4 as uuidv4 } from 'uuid';

export class Catalog {
  public readonly id: string;
  public key: string;
  public name: string;
  public description: string | null;
  public allowMultiple: boolean;
  public isActive: boolean;
  public createdBy: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    key: string,
    name: string,
    description: string | null = null,
    allowMultiple: boolean = false,
    isActive: boolean = true,
    createdBy: string = 'system',
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4();
    this.key = key;
    this.name = name;
    this.description = description;
    this.allowMultiple = allowMultiple;
    this.isActive = isActive;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public update(data: Partial<Pick<Catalog, 'name' | 'description' | 'allowMultiple' | 'isActive'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.allowMultiple !== undefined) this.allowMultiple = data.allowMultiple;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    this.updatedAt = new Date();
  }
}

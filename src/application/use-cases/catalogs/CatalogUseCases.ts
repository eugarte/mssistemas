import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';
import { Catalog, CatalogValue } from '@domain/entities/Catalog';
import { CreateCatalogDto, UpdateCatalogDto, CreateCatalogValueDto, UpdateCatalogValueDto, CatalogResponseDto, CatalogValueResponseDto } from '@application/dtos/CatalogDto';

export class CreateCatalogUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(dto: CreateCatalogDto, userId?: string): Promise<CatalogResponseDto> {
    const catalog = new Catalog({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      allowMultiple: dto.allowMultiple || false,
      createdBy: userId,
    });

    const saved = await this.repository.save(catalog);
    return this.toResponseDto(saved);
  }

  private toResponseDto(catalog: Catalog): CatalogResponseDto {
    return {
      id: catalog.id,
      key: catalog.key,
      name: catalog.name,
      description: catalog.description,
      allowMultiple: catalog.allowMultiple,
      isActive: catalog.isActive,
      values: catalog.values?.map(v => this.toValueResponseDto(v)),
      createdAt: catalog.createdAt,
      updatedAt: catalog.updatedAt,
    };
  }

  private toValueResponseDto(value: CatalogValue): CatalogValueResponseDto {
    return {
      id: value.id,
      code: value.code,
      label: value.label,
      description: value.description,
      color: value.color,
      sortOrder: value.sortOrder,
      isDefault: value.isDefault,
      isActive: value.isActive,
    };
  }
}

export class GetCatalogsUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(): Promise<CatalogResponseDto[]> {
    const catalogs = await this.repository.findAll();
    return catalogs.map(c => this.toResponseDto(c));
  }

  async executeByKey(key: string): Promise<CatalogResponseDto | null> {
    const catalog = await this.repository.findByKey(key);
    return catalog ? this.toResponseDto(catalog) : null;
  }

  private toResponseDto(catalog: Catalog): CatalogResponseDto {
    return {
      id: catalog.id,
      key: catalog.key,
      name: catalog.name,
      description: catalog.description,
      allowMultiple: catalog.allowMultiple,
      isActive: catalog.isActive,
      values: catalog.values?.map(v => ({
        id: v.id,
        code: v.code,
        label: v.label,
        description: v.description,
        color: v.color,
        sortOrder: v.sortOrder,
        isDefault: v.isDefault,
        isActive: v.isActive,
      })),
      createdAt: catalog.createdAt,
      updatedAt: catalog.updatedAt,
    };
  }
}

export class UpdateCatalogUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(id: string, dto: UpdateCatalogDto): Promise<CatalogResponseDto | null> {
    const updated = await this.repository.update(id, {
      name: dto.name,
      description: dto.description,
      allowMultiple: dto.allowMultiple,
      isActive: dto.isActive,
    });

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(catalog: Catalog): CatalogResponseDto {
    return {
      id: catalog.id,
      key: catalog.key,
      name: catalog.name,
      description: catalog.description,
      allowMultiple: catalog.allowMultiple,
      isActive: catalog.isActive,
      createdAt: catalog.createdAt,
      updatedAt: catalog.updatedAt,
    };
  }
}

export class DeleteCatalogUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }
}

export class CreateCatalogValueUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(catalogId: string, dto: CreateCatalogValueDto): Promise<CatalogValueResponseDto> {
    const value = new CatalogValue({
      catalogId,
      code: dto.code,
      label: dto.label,
      description: dto.description,
      color: dto.color,
      sortOrder: dto.sortOrder || 0,
      isDefault: dto.isDefault || false,
    });

    const saved = await this.repository.saveValue(value);
    return this.toResponseDto(saved);
  }

  private toResponseDto(value: CatalogValue): CatalogValueResponseDto {
    return {
      id: value.id,
      code: value.code,
      label: value.label,
      description: value.description,
      color: value.color,
      sortOrder: value.sortOrder,
      isDefault: value.isDefault,
      isActive: value.isActive,
    };
  }
}

export class GetCatalogValuesUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(catalogId: string): Promise<CatalogValueResponseDto[]> {
    const values = await this.repository.findValuesByCatalogId(catalogId);
    return values.map(v => this.toResponseDto(v));
  }

  async executeByKey(key: string): Promise<CatalogValueResponseDto[]> {
    const catalog = await this.repository.findByKey(key);
    if (!catalog) return [];
    return catalog.values?.filter(v => v.isActive).map(v => this.toResponseDto(v)) || [];
  }

  private toResponseDto(value: CatalogValue): CatalogValueResponseDto {
    return {
      id: value.id,
      code: value.code,
      label: value.label,
      description: value.description,
      color: value.color,
      sortOrder: value.sortOrder,
      isDefault: value.isDefault,
      isActive: value.isActive,
    };
  }
}

export class ValidateCatalogValueUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(catalogKey: string, code: string): Promise<boolean> {
    const catalog = await this.repository.findByKey(catalogKey);
    if (!catalog) return false;
    return catalog.validateCode(code);
  }
}

export class UpdateCatalogValueUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(valueId: string, dto: UpdateCatalogValueDto): Promise<CatalogValueResponseDto | null> {
    const updated = await this.repository.updateValue(valueId, {
      label: dto.label,
      description: dto.description,
      color: dto.color,
      sortOrder: dto.sortOrder,
      isDefault: dto.isDefault,
      isActive: dto.isActive,
    });

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(value: CatalogValue): CatalogValueResponseDto {
    return {
      id: value.id,
      code: value.code,
      label: value.label,
      description: value.description,
      color: value.color,
      sortOrder: value.sortOrder,
      isDefault: value.isDefault,
      isActive: value.isActive,
    };
  }
}

export class DeleteCatalogValueUseCase {
  constructor(private repository: ICatalogRepository) {}

  async execute(valueId: string): Promise<boolean> {
    return this.repository.softDeleteValue(valueId);
  }
}

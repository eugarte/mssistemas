import { v4 as uuidv4 } from 'uuid';

export class Secret {
  public readonly id: string;
  public serviceId: string | null;
  public environment: string | null;
  public key: string;
  public encryptedValue: string;
  public encryptionVersion: string;
  public isRotating: boolean;
  public lastRotatedAt: Date | null;
  public expiresAt: Date | null;
  public createdBy: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    key: string,
    encryptedValue: string,
    encryptionVersion: string = 'v1',
    serviceId: string | null = null,
    environment: string | null = null,
    expiresAt: Date | null = null,
    createdBy: string = 'system',
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    lastRotatedAt?: Date | null,
    isRotating: boolean = false
  ) {
    this.id = id || uuidv4();
    this.serviceId = serviceId;
    this.environment = environment;
    this.key = key;
    this.encryptedValue = encryptedValue;
    this.encryptionVersion = encryptionVersion;
    this.isRotating = isRotating;
    this.lastRotatedAt = lastRotatedAt || null;
    this.expiresAt = expiresAt;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public rotate(newEncryptedValue: string): void {
    this.encryptedValue = newEncryptedValue;
    this.lastRotatedAt = new Date();
    this.isRotating = false;
    this.updatedAt = new Date();
  }

  public startRotation(): void {
    this.isRotating = true;
    this.updatedAt = new Date();
  }

  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
}

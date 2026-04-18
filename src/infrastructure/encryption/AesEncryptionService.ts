import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { IEncryptionService } from './IEncryptionService';

export class AesEncryptionService implements IEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(masterKey: string) {
    // Derive a 32-byte key from the master key using scrypt
    this.key = scryptSync(masterKey, 'salt', 32);
  }

  encrypt(value: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

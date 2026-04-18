import { v4 as uuidv4 } from 'uuid';

export type FeatureFlagStrategy = 'simple' | 'percentage' | 'user_target' | 'group_target' | 'schedule';

export class FeatureFlag {
  public readonly id: string;
  public key: string;
  public name: string;
  public description: string | null;
  public enabled: boolean;
  public strategy: FeatureFlagStrategy;
  public percentage: number | null;
  public targetUsers: string[];
  public targetGroups: string[];
  public scheduleStart: Date | null;
  public scheduleEnd: Date | null;
  public createdBy: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    key: string,
    name: string,
    description: string | null = null,
    enabled: boolean = false,
    strategy: FeatureFlagStrategy = 'simple',
    percentage: number | null = null,
    targetUsers: string[] = [],
    targetGroups: string[] = [],
    scheduleStart: Date | null = null,
    scheduleEnd: Date | null = null,
    createdBy: string = 'system',
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4();
    this.key = key;
    this.name = name;
    this.description = description;
    this.enabled = enabled;
    this.strategy = strategy;
    this.percentage = percentage;
    this.targetUsers = targetUsers;
    this.targetGroups = targetGroups;
    this.scheduleStart = scheduleStart;
    this.scheduleEnd = scheduleEnd;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public update(data: Partial<Pick<FeatureFlag, 'name' | 'description' | 'enabled' | 'strategy' | 'percentage' | 'targetUsers' | 'targetGroups' | 'scheduleStart' | 'scheduleEnd'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.enabled !== undefined) this.enabled = data.enabled;
    if (data.strategy !== undefined) this.strategy = data.strategy;
    if (data.percentage !== undefined) this.percentage = data.percentage;
    if (data.targetUsers !== undefined) this.targetUsers = data.targetUsers;
    if (data.targetGroups !== undefined) this.targetGroups = data.targetGroups;
    if (data.scheduleStart !== undefined) this.scheduleStart = data.scheduleStart;
    if (data.scheduleEnd !== undefined) this.scheduleEnd = data.scheduleEnd;
    this.updatedAt = new Date();
  }

  public toggle(): void {
    this.enabled = !this.enabled;
    this.updatedAt = new Date();
  }

  public evaluate(userId?: string, userGroups?: string[]): boolean {
    if (!this.enabled) return false;

    // Check schedule
    const now = new Date();
    if (this.scheduleStart && now < this.scheduleStart) return false;
    if (this.scheduleEnd && now > this.scheduleEnd) return false;

    switch (this.strategy) {
      case 'simple':
        return this.enabled;
      
      case 'percentage':
        if (!this.percentage) return false;
        if (!userId) return Math.random() * 100 < this.percentage;
        // Deterministic based on userId
        const hash = this.hashString(userId + this.key);
        return (hash % 100) < this.percentage;
      
      case 'user_target':
        if (!userId || this.targetUsers.length === 0) return false;
        return this.targetUsers.includes(userId);
      
      case 'group_target':
        if (!userGroups || this.targetGroups.length === 0) return false;
        return this.targetGroups.some(group => userGroups.includes(group));
      
      case 'schedule':
        // Already checked schedule above
        return true;
      
      default:
        return false;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

import { Injectable, Logger } from '@nestjs/common';

type HhRole = { id: number; name: string; [key: string]: unknown };
type HhRoleGroup = { id: number | string; name: string; roles: HhRole[] };

export type FlatRole = {
  id: number;
  name: string;
  groupName: string;
  groupId?: number;
};

@Injectable()
export class HhService {
  private readonly logger = new Logger(HhService.name);
  private cache: {
    fetchedAt: number;
    roles: FlatRole[];
    groups: HhRoleGroup[];
  } | null = null;
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24h

  private get userAgent() {
    return process.env.HH_USER_AGENT || 'po9avan-bot/1.0 (+https://github.com)';
  }

  private async fetchRolesFromApi(): Promise<{
    flat: FlatRole[];
    groups: HhRoleGroup[];
  }> {
    const url = 'https://api.hh.ru/professional_roles';
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      });
      if (!resp.ok) {
        this.logger.warn(`HH roles request failed: ${resp.status}`);
        return { flat: [], groups: [] };
      }
      const json = await resp.json();
      const data: HhRoleGroup[] = Array.isArray(json)
        ? (json as HhRoleGroup[])
        : ((json as any).categories as HhRoleGroup[]) || [];
      const flat: FlatRole[] = [];
      for (const group of data) {
        for (const role of group.roles || []) {
          flat.push({
            id: Number(role.id),
            name: String(role.name),
            groupName: String(group.name),
            groupId: Number(group.id),
          });
        }
      }
      return { flat, groups: data };
    } catch (e) {
      this.logger.error('Failed to fetch HH roles', e as Error);
      return { flat: [], groups: [] };
    }
  }

  async getAllRoles(): Promise<FlatRole[]> {
    const now = Date.now();
    if (this.cache && now - this.cache.fetchedAt < this.cacheTtlMs) {
      return this.cache.roles;
    }
    const { flat, groups } = await this.fetchRolesFromApi();
    this.cache = { fetchedAt: now, roles: flat, groups };
    return flat;
  }

  async searchRoles(query: string, limit = 20): Promise<FlatRole[]> {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    const roles = await this.getAllRoles();
    return roles
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async getById(id: number): Promise<FlatRole | undefined> {
    const roles = await this.getAllRoles();
    return roles.find((r) => r.id === id);
  }

  async getGroups(): Promise<HhRoleGroup[]> {
    const now = Date.now();
    if (!this.cache || now - this.cache.fetchedAt >= this.cacheTtlMs) {
      const { flat, groups } = await this.fetchRolesFromApi();
      this.cache = { fetchedAt: now, roles: flat, groups };
    }
    return this.cache.groups;
  }

  async searchGroups(query: string, limit = 20): Promise<HhRoleGroup[]> {
    const q = (query || '').trim().toLowerCase();
    const groups = await this.getGroups();
    const filtered = q
      ? groups.filter((g) => g.name.toLowerCase().includes(q))
      : groups;
    return filtered.slice(0, limit);
  }

  async getGroupById(id: number): Promise<HhRoleGroup | undefined> {
    const groups = await this.getGroups();
    return groups.find((g) => Number(g.id) === Number(id));
  }

  async searchRolesInGroup(
    groupId: number,
    query: string,
    limit = 20,
  ): Promise<FlatRole[]> {
    const q = (query || '').trim().toLowerCase();
    const groups = await this.getGroups();
    const group = groups.find((g) => Number(g.id) === Number(groupId));
    if (!group) return [];
    const roles = (group.roles || []).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      groupName: String(group.name),
    }));
    const filtered = q
      ? roles.filter((r) => r.name.toLowerCase().includes(q))
      : roles;
    return filtered.slice(0, limit);
  }

  parseCategoryQuery(query: string): { groupId?: number; rest: string } {
    const m = /^(?:cat:|category:)(\d+)\s*(.*)$/i.exec(query || '');
    if (!m) return { rest: query || '' };
    return { groupId: Number(m[1]), rest: m[2] || '' };
  }
}

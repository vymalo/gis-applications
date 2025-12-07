import { trpcClient } from '@app/trpc/client';
import type { DataProvider } from 'ra-core';

// TODO Remove any...
export const trpcDataProvider: DataProvider = {
  // Basic getList implementation for the `applications` resource.
  async getList(resource: string, params: any) {
    if (resource !== 'applications') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    const { page, perPage } = params.pagination ?? { page: 1, perPage: 10 };
    const q = params.filter?.q ?? '';

    const entries = await trpcClient.application.getSome.query({
      page: page - 1,
      size: perPage,
      q,
      groupBy: 'status',
    });

    // entries is an array of [groupKey, Application[]]
    const data = entries.flatMap(([, applications]) => applications);
    const total = data.length;

    return { data, total };
  },

  async getOne(resource: string, params: any) {
    if (resource !== 'applications') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    const data = await trpcClient.application.getApplication.query({
      id: params.id,
    });

    return { data };
  },

  // The remaining methods are placeholders for now and will be implemented
  // when corresponding tRPC mutations are wired for React Admin usage.
  async getMany() {
    return { data: [] };
  },
  async getManyReference() {
    return { data: [], total: 0 };
  },
  async create(d) {
    return { data: { id: '' } } as any;
  },
  async update() {
    return { data: { id: '' } } as any;
  },
  async updateMany() {
    return { data: [] };
  },
  async delete() {
    return { data: {} } as any;
  },
  async deleteMany() {
    return { data: [] };
  },
};

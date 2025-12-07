'use client';

import { Admin, Resource } from 'react-admin';

import { adminAuthProvider } from '@app/admin/auth-provider';
import { trpcDataProvider } from '@app/admin/dataProvider/trpc-data-provider';
import {
  ApplicationList,
  ApplicationShow,
} from '@app/admin/resources/applications';

export function AdminApp() {
  return (
    <Admin
      dataProvider={trpcDataProvider}
      authProvider={adminAuthProvider}>
      <Resource
        name='applications'
        list={ApplicationList}
        show={ApplicationShow}
      />
    </Admin>
  );
}

'use client';

import {
  Datagrid,
  DateField,
  EmailField,
  FunctionField,
  List,
  Show,
  SimpleShowLayout,
  TextField,
  type ListProps,
  type ShowProps,
} from 'react-admin';

export function ApplicationList(props: ListProps) {
  return (
    <List {...props} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
      <Datagrid rowClick='show'>
        <TextField source='id' label='ID' />
        <EmailField source='email' label='Email' />
        <TextField source='status' label='Status' />
        <FunctionField
          label='First name'
          render={(record: any) => record?.data?.firstName ?? ''}
        />
        <FunctionField
          label='Last name'
          render={(record: any) => record?.data?.lastName ?? ''}
        />
        <DateField source='createdAt' label='Created at' />
      </Datagrid>
    </List>
  );
}

export function ApplicationShow(props: ShowProps) {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source='id' label='ID' />
        <EmailField source='email' label='Email' />
        <TextField source='status' label='Status' />
        <DateField source='createdAt' label='Created at' />
        <FunctionField
          label='First name'
          render={(record: any) => record?.data?.firstName ?? ''}
        />
        <FunctionField
          label='Last name'
          render={(record: any) => record?.data?.lastName ?? ''}
        />
      </SimpleShowLayout>
    </Show>
  );
}


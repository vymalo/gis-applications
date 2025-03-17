import { ApplicationListItem } from '@app/components/skeleton/application-list-item';

export default async function SingleApplicationModalLoaderPage() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Applications</h1>

      <div className='flex flex-row gap-4'>
        <div className='skeleton h-12 w-full' />
        <div>
          <div className='skeleton size-12 rounded-full' />
        </div>
      </div>

      <ul className='list bg-base-100'>
        <li className='p-4 pb-2'>
          <div className='skeleton h-8 w-40' />
        </li>

        <li className='list-row'>
          <ApplicationListItem />
        </li>
        <li className='list-row'>
          <ApplicationListItem />
        </li>
        <li className='list-row'>
          <ApplicationListItem />
        </li>
        <li className='list-row'>
          <ApplicationListItem />
        </li>
      </ul>
    </div>
  );
}

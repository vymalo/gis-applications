export function ApplicationListItem() {
  return (
    <div className='flex items-center gap-4'>
      <div className='skeleton size-12 shrink-0 rounded-full'></div>
      <div className='flex flex-col gap-4'>
        <div className='skeleton h-4 w-52'></div>
        <div className='skeleton h-2 w-72'></div>
      </div>
    </div>
  )
}
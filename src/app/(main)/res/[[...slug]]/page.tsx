import { loadRes } from '@app/server/md/utils';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return [
    {},
    {
      slug: 'faq',
    },
    {
      slug: 'tos',
    },
    {
      slug: 'contact',
    },
    {
      slug: 'privacy',
    },
  ];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!slug) {
    return null;
  }

  const content = await loadRes(slug);
  if (!content) {
    return null;
  }

  return {
    title: `${content.title} | GIS App`,
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  if (!slug) {
    return redirect('/');
  }

  const content = await loadRes(slug);
  return (
    <main className='prose'>
      <div dangerouslySetInnerHTML={{ __html: content.contentHtml! }} />
    </main>
  );
}

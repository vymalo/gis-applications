import { env } from '@app/env';
import { createId } from '@paralleldrive/cuid2';
import { client } from './client';

const maxAge = 3600 * 2; // 24 hours

export async function createPresignedPostUrl({
  filename,
  userId,
}: {
  filename: string;
  userId: string;
}) {
  const objectName = `users/${userId}/${createId()}-${filename}`;
  const url = await client.presignedPutObject(
    env.S3_BUCKET,
    objectName,
    maxAge,
  );
  const publicUrl = `${getBasePublicUrl()}/${env.S3_BUCKET}/${objectName}`;
  return { url, publicUrl };
}

export function getBasePublicUrl() {
  if (process.env.S3_CDN_URL) {
    return env.S3_CDN_URL;
  }

  return `${env.S3_SCHEME}://${env.S3_ENDPOINT}:${env.S3_PORT}`;
}

export async function createPresignedGetUrl(publicUrl: string) {
  const url = new URL(publicUrl);
  const path = url.pathname.replace(/^\/+/, '');
  const bucketPrefix = `${env.S3_BUCKET}/`;
  const objectName = path.startsWith(bucketPrefix)
    ? path.slice(bucketPrefix.length)
    : path;

  const signedUrl = await client.presignedGetObject(
    env.S3_BUCKET,
    objectName,
    maxAge,
  );

  return { url: signedUrl };
}

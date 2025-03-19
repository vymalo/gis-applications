import { redirect } from 'next/navigation';

export default function ApplicationNotFound() {
  redirect('/');
}
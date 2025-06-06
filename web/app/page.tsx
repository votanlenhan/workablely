import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
  
  // This part will not be rendered because of the redirect.
  // It's here to satisfy the return type of a React component.
  return null;
}

import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

export default async function ChatPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return notFound();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Chat Session: {params.id}</h1>
      <div className="w-full max-w-2xl border rounded-lg p-4 bg-white shadow">
        {/* Chat UI goes here */}
        <p className="text-gray-500">Chat functionality coming soon...</p>
      </div>
    </main>
  );
} 
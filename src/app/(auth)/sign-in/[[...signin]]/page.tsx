'use client'
import React from 'react'
import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function SigninPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/generate';
  return (
    <main className='flex flex-col h-screen w-full items-center justify-center '>
        <SignIn redirectUrl={redirectUrl} />
    </main>
  )
}
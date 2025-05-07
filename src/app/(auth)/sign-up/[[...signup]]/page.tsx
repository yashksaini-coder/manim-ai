'use client'
import React from 'react'
import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/generate';
  return (
    <main className='flex flex-col h-screen w-full items-center justify-center '>
        <SignUp redirectUrl={redirectUrl}/>
    </main>
  )
}
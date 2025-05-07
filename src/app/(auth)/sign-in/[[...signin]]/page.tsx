import React from 'react'
import { SignIn } from '@clerk/nextjs'
export default function SigninPage() {
  return (
    <main className='flex flex-col h-screen w-full items-center justify-center '>
        <SignIn/>
    </main>
  )
}
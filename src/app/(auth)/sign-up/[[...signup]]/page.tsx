import React from 'react'
import { SignUp } from '@clerk/nextjs'
export default function SignupPage() {
  return (
    <main className='flex flex-col h-screen w-full items-center justify-center '>
        <SignUp/>
    </main>
  )
}
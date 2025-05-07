import Chatpage from '@/components/ChatPage'
import React from 'react'

export default function page({params: { chatId } }: { params: { chatId: string } }) {
  return (
    <div>
        <Chatpage chatId={chatId} />
    </div>
  )
}

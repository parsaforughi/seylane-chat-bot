'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, User, Bot } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ConversationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchConversation()
    }
  }, [id])

  const fetchConversation = async () => {
    try {
      const data = await api.conversations.get(parseInt(id))
      setConversation(data.conversation)
      setMessages(data.messages)
    } catch (error) {
      console.error('Error fetching conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/conversations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {conversation?.instagramUsername || 'Conversation'}
          </h1>
          <p className="text-gray-600 mt-1">
            ID: {conversation?.instagramUserId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>
            {messages.length} messages exchanged
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading messages...</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                  <div className={`flex-1 ${
                    msg.role === 'user' ? 'text-left' : 'text-right'
                  }`}>
                    <div className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{formatDate(msg.timestamp)}</span>
                      {msg.intent && (
                        <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                          {msg.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


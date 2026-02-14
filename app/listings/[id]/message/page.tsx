'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { parseResponseJson } from '@/lib/utils'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'

type MessageRow = {
  id: string
  content: string
  imageUrl: string | null
  senderId: string
  receiverId: string
  createdAt: string
  sender: { id: string; firstName: string; lastName: string }
}

type ThreadData = {
  messages: MessageRow[]
  listing: { id: string; title: string; hostId: string }
  otherUserId: string
}

export default function ListingMessagePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const listingId = params.id as string
  const withUserId = searchParams.get('with')

  const [data, setData] = useState<ThreadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchThread = async () => {
    try {
      const url = withUserId
        ? `/api/listings/${listingId}/messages?with=${encodeURIComponent(withUserId)}`
        : `/api/listings/${listingId}/messages`
      const res = await fetch(url)
      const json = await parseResponseJson<ThreadData & { error?: string }>(res)

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/listings/${listingId}/message`)
          return
        }
        setData(null)
        return
      }

      setData({
        messages: json.messages ?? [],
        listing: json.listing!,
        otherUserId: json.otherUserId!,
      })
    } catch (err) {
      console.error('Error fetching thread:', err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(`/login?redirect=/listings/${listingId}/message`)
      return
    }
    fetchThread()
  }, [listingId, withUserId, user?.userId, authLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  const sendMessage = async () => {
    if (!message.trim() || !data) return

    setSendingMessage(true)
    try {
      const body: { listingId: string; content: string; receiverId?: string } = {
        listingId,
        content: message.trim(),
      }
      if (data.listing.hostId === user?.userId) {
        body.receiverId = data.otherUserId
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await parseResponseJson<{ error?: string }>(res)
        alert(err?.error || 'Failed to send message')
        return
      }

      setMessage('')
      fetchThread()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Cannot load messages</h1>
          <Link href={`/listings/${listingId}`} className="text-car-neon hover:underline">
            Back to listing
          </Link>
        </div>
      </div>
    )
  }

  const isHost = data.listing.hostId === user?.userId

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={`/listings/${listingId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to listing
        </Link>

        <FloatingCard glowColor="turbo">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.listing.title}</h1>
          <p className="text-sm text-gray-500 mb-4">
            {isHost ? 'Conversation with driver' : 'Conversation with host'}
          </p>

          <div
            className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 space-y-3 bg-gray-50"
            id="messages"
          >
            {data.messages.length > 0 ? (
              data.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      msg.senderId === user?.userId
                        ? 'bg-car-neon/10 text-gray-900 border border-car-neon/30'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-xs mb-1 opacity-75">
                      {msg.sender.firstName} {msg.sender.lastName}
                    </p>
                    {msg.imageUrl && (
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-2 rounded overflow-hidden max-w-[200px]"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="Shared"
                          className="max-h-[200px] object-cover rounded"
                        />
                      </a>
                    )}
                    {msg.content ? <p>{msg.content}</p> : null}
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No messages yet. Say hello!</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-car-neon focus:border-car-neon"
            />
            <NeonButton
              variant="primary"
              onClick={sendMessage}
              disabled={sendingMessage || !message.trim()}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </NeonButton>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}

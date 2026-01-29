'use client'

import { useEffect, useState, useRef } from 'react'

type ChatMessage = {
  id: string
  character_id: string
  character_name: string
  message: string
  created_at: string
}

type Props = {
  instanceId: string
  myCharacterId: string | undefined
  accessToken: string | null
}

export default function CharacterChat({
  instanceId,
  myCharacterId,
  accessToken,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  useEffect(() => {
    if (!accessToken) return

    const loadMessages = async () => {
      try {
        const response = await fetch(
          `/api/multiverse/instances/${instanceId}/chat`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()

    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000)
    return () => clearInterval(interval)
  }, [instanceId, accessToken])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !accessToken || !myCharacterId) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/multiverse/instances/${instanceId}/chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.trim(),
          }),
        }
      )

      if (response.ok) {
        setNewMessage('')
        // Messages will update via polling
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <h3 className="text-white font-semibold">Character Chat</h3>
        <p className="text-purple-200 text-sm">Chat anonymously as your character</p>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-purple-300 text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.character_id === myCharacterId
                  ? 'bg-purple-600/50 ml-auto max-w-[80%]'
                  : 'bg-white/5 max-w-[80%]'
              }`}
            >
              <div className="text-purple-300 text-xs mb-1 font-semibold">
                {msg.character_name}
              </div>
              <div className="text-white text-sm">{msg.message}</div>
              <div className="text-purple-400 text-xs mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
            disabled={loading || !myCharacterId}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim() || !myCharacterId}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

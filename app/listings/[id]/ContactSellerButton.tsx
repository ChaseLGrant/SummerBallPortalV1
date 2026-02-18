'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/types/database'
import { toast } from 'sonner'

interface ContactSellerButtonProps {
  listing: Listing
}

export default function ContactSellerButton({ listing }: ContactSellerButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to contact the seller.')
      router.push('/auth/login')
      return
    }

    if (user.id === listing.seller_id) {
      toast.error('You cannot message yourself.')
      setSending(false)
      return
    }

    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.seller_id,
      content: message,
    })

    if (error) {
      toast.error('Failed to send message: ' + error.message)
      setSending(false)
      return
    }

    toast.success('Message sent to seller!')
    setMessage('')
    setOpen(false)
    setSending(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        Contact Seller
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-semibold text-gray-900">
              Message about &quot;{listing.title}&quot;
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="input-field mt-4"
              placeholder="Hi, I'm interested in this listing…"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="btn-primary"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

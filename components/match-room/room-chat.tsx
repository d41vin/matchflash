"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { makeFunctionReference } from "convex/server"
import { MessageCircleIcon } from "lucide-react"

import { useMatchFlashAuth } from "@/components/auth/matchflash-providers"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import type { Id } from "@/convex/_generated/dataModel"

const listMessages = makeFunctionReference<
  "query",
  { roomId: Id<"rooms"> },
  Array<{
    _id: Id<"chatMessages">
    author: { displayName: string; avatarColor: string }
    body: string
    createdAt: number
  }>
>("chat:list")
const sendMessage = makeFunctionReference<
  "mutation",
  { roomId: Id<"rooms">; body: string },
  null
>("chat:send")

const AVATAR_COLORS: Record<string, string> = {
  amber: "bg-amber-300 text-amber-950",
  cyan: "bg-cyan-300 text-cyan-950",
  rose: "bg-rose-300 text-rose-950",
  violet: "bg-violet-300 text-violet-950",
}

function messageTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp)
}

export function RoomChat({
  roomId,
  readOnly = false,
}: {
  roomId: Id<"rooms">
  readOnly?: boolean
}) {
  const { isAuthenticated, isLoading, requestSignIn } = useMatchFlashAuth()
  const messages = useQuery(listMessages, isAuthenticated ? { roomId } : "skip")
  const send = useMutation(sendMessage)
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  async function sendChatMessage() {
    if (!isAuthenticated) {
      setStatus("Sign in to chat with this Room.")
      await requestSignIn()
      return
    }
    if (!body.trim()) return

    setIsSending(true)
    setStatus(null)
    try {
      await send({ roomId, body })
      setBody("")
    } catch (cause) {
      setStatus(
        cause instanceof Error ? cause.message : "Could not send message."
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Collapsible className="mt-5">
      <CollapsibleTrigger className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/30 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-200/10">
        <MessageCircleIcon aria-hidden="true" className="size-4" />
        Open chat
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-slate-100">
        <div className="border-b border-white/10 px-5 py-4">
          <h4 className="font-semibold text-white">Room chat</h4>
          <p className="mt-1 text-sm text-slate-400">
            {readOnly
              ? "This Room is read-only after full time."
              : "Messages are visible to this Room's members during the match."}
          </p>
        </div>

        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="h-80 max-h-[50svh]">
            <MessageScrollerViewport
              aria-label="Room chat messages"
              className="px-5 py-4"
            >
              <MessageScrollerContent className="gap-4">
                {messages?.length ? (
                  messages.map((message) => (
                    <MessageScrollerItem
                      key={message._id}
                      messageId={message._id}
                    >
                      <MessageGroup>
                        <Message>
                          <MessageAvatar
                            className={
                              AVATAR_COLORS[message.author.avatarColor] ??
                              "bg-slate-700 text-slate-100"
                            }
                          >
                            {message.author.displayName.slice(0, 1)}
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>
                              {message.author.displayName}
                            </MessageHeader>
                            <p className="max-w-[30rem] rounded-2xl rounded-bl-sm bg-slate-800 px-3 py-2 text-slate-100">
                              {message.body}
                            </p>
                            <MessageFooter>
                              {messageTime(message.createdAt)}
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageGroup>
                    </MessageScrollerItem>
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-slate-400">
                    No messages yet. Start the conversation.
                  </p>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        {!readOnly ? (
          <form
            className="border-t border-white/10 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              void sendChatMessage()
            }}
          >
            <label className="sr-only" htmlFor={`room-chat-${roomId}`}>
              Message
            </label>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-200"
                disabled={isLoading || isSending}
                id={`room-chat-${roomId}`}
                maxLength={500}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Say something"
                value={body}
              />
              <button
                className="rounded-xl bg-cyan-200 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
                disabled={isLoading || isSending || !body.trim()}
                type="submit"
              >
                Send
              </button>
            </div>
            {status ? (
              <p aria-live="polite" className="mt-2 text-sm text-cyan-100">
                {status}
              </p>
            ) : null}
          </form>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}

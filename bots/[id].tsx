"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function BotManagement() {
  const router = useRouter()
  const { id } = router.query
  const [bot, setBot] = useState(null)
  const [logs, setLogs] = useState("")

  useEffect(() => {
    // Fetch bot details
    const fetchBot = async () => {
      const response = await fetch(`/api/bots/${id}`)
      const data = await response.json()
      setBot(data)
    }

    if (id) {
      fetchBot()
      // Set up WebSocket connection for real-time logs
      const socket = new WebSocket(`ws://localhost:3000/api/logs/${id}`)
      socket.onmessage = (event) => {
        setLogs((prevLogs) => prevLogs + event.data + "\n")
      }

      return () => {
        socket.close()
      }
    }
  }, [id])

  const handleStart = async () => {
    await fetch(`/api/bots/${id}/start`, { method: "POST" })
    // Refresh bot status
  }

  const handleStop = async () => {
    await fetch(`/api/bots/${id}/stop`, { method: "POST" })
    // Refresh bot status
  }

  if (!bot) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{bot.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Bot Configuration</h2>
          <Input placeholder="Bot Token" value={bot.token} readOnly className="mb-2" />
          <Input placeholder="MySQL Host" value={bot.mysqlHost} readOnly className="mb-2" />
          <Input placeholder="MySQL User" value={bot.mysqlUser} readOnly className="mb-2" />
          <Input placeholder="MySQL Database" value={bot.mysqlDatabase} readOnly className="mb-2" />
          <Button onClick={handleStart} className="mr-2">
            Start Bot
          </Button>
          <Button onClick={handleStop} variant="destructive">
            Stop Bot
          </Button>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Logs</h2>
          <Textarea value={logs} readOnly className="h-64" />
        </div>
      </div>
    </div>
  )
}


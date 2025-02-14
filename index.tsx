"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { data: session } = useSession()
  const [bots, setBots] = useState([])

  useEffect(() => {
    // Fetch bots from API
    const fetchBots = async () => {
      const response = await fetch("/api/bots")
      const data = await response.json()
      setBots(data)
    }

    if (session) {
      fetchBots()
    }
  }, [session])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Telegram Bot Manager</h1>
      {session ? (
        <div>
          <Link href="/bots/new">
            <Button>Add New Bot</Button>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {bots.map((bot) => (
              <Card key={bot.id}>
                <CardHeader>
                  <CardTitle>{bot.name}</CardTitle>
                  <CardDescription>{bot.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Language: {bot.language}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/bots/${bot.id}`}>
                    <Button variant="outline">Manage</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p>Please sign in to manage your bots.</p>
      )}
    </div>
  )
}


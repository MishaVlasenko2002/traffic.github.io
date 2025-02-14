"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function NewBot() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [mysqlHost, setMysqlHost] = useState("")
  const [mysqlUser, setMysqlUser] = useState("")
  const [mysqlPassword, setMysqlPassword] = useState("")
  const [mysqlDatabase, setMysqlDatabase] = useState("")
  const [code, setCode] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch("/api/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        token,
        language,
        mysqlHost,
        mysqlUser,
        mysqlPassword,
        mysqlDatabase,
      }),
    })

    if (response.ok) {
      const bot = await response.json()
      // Upload code
      const formData = new FormData()
      formData.append("file", new Blob([code], { type: "text/plain" }), "index.js")
      await fetch(`/api/bots/${bot.id}/upload`, {
        method: "POST",
        body: formData,
      })
      router.push(`/bots/${bot.id}`)
    } else {
      // Handle error
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Add New Bot</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Input placeholder="Bot Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Bot Token" value={token} onChange={(e) => setToken(e.target.value)} required />
        <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </Select>
        <Input placeholder="MySQL Host" value={mysqlHost} onChange={(e) => setMysqlHost(e.target.value)} required />
        <Input placeholder="MySQL User" value={mysqlUser} onChange={(e) => setMysqlUser(e.target.value)} required />
        <Input
          placeholder="MySQL Password"
          type="password"
          value={mysqlPassword}
          onChange={(e) => setMysqlPassword(e.target.value)}
          required
        />
        <Input
          placeholder="MySQL Database"
          value={mysqlDatabase}
          onChange={(e) => setMysqlDatabase(e.target.value)}
          required
        />
        <Textarea placeholder="Bot Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <Button type="submit">Create Bot</Button>
      </form>
    </div>
  )
}


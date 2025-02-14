import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    const bots = await prisma.bot.findMany({
      where: { userId: session.user.id },
    })
    return res.status(200).json(bots)
  } else if (req.method === "POST") {
    const { name, token, language, mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase } = req.body
    const bot = await prisma.bot.create({
      data: {
        name,
        token,
        language,
        mysqlHost,
        mysqlUser,
        mysqlPassword,
        mysqlDatabase,
        userId: session.user.id,
      },
    })
    return res.status(201).json(bot)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}


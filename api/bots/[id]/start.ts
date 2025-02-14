import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { PrismaClient } from "@prisma/client"
import pm2 from "pm2"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { id } = req.query

  const bot = await prisma.bot.findUnique({
    where: { id: Number(id) },
  })

  if (!bot || bot.userId !== session.user.id) {
    return res.status(404).json({ error: "Bot not found" })
  }

  // Start the bot using PM2
  pm2.connect((err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: "Failed to connect to PM2" })
    }

    pm2.start(
      {
        script: `bots/${bot.id}/index.js`,
        name: `bot-${bot.id}`,
        env: {
          BOT_TOKEN: bot.token,
          MYSQL_HOST: bot.mysqlHost,
          MYSQL_USER: bot.mysqlUser,
          MYSQL_PASSWORD: bot.mysqlPassword,
          MYSQL_DATABASE: bot.mysqlDatabase,
        },
      },
      (err) => {
        pm2.disconnect()
        if (err) {
          console.error(err)
          return res.status(500).json({ error: "Failed to start bot" })
        }
        res.status(200).json({ message: "Bot started successfully" })
      },
    )
  })
}


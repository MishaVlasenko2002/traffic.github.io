import { PrismaClient } from "@prisma/client"
import pm2 from "pm2"

const prisma = new PrismaClient()

export async function monitorBots() {
  pm2.connect((err) => {
    if (err) {
      console.error("Failed to connect to PM2:", err)
      return
    }

    pm2.list((err, processList) => {
      if (err) {
        console.error("Failed to get process list:", err)
        pm2.disconnect()
        return
      }

      processList.forEach(async (process) => {
        if (process.name.startsWith("bot-")) {
          const botId = Number.parseInt(process.name.split("-")[1])
          const status = process.pm2_env.status

          await prisma.bot.update({
            where: { id: botId },
            data: { status },
          })

          if (status === "errored" || status === "stopped") {
            // Send notification (e.g., email, push notification)
            console.log(`Bot ${botId} is ${status}`)
          }
        }
      })

      pm2.disconnect()
    })
  })
}

// Run the monitor every 5 minutes
setInterval(monitorBots, 5 * 60 * 1000)


import type { NextApiRequest } from "next"
import { Server } from "socket.io"
import pm2 from "pm2"

export default function handler(req: NextApiRequest, res: any) {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      const botId = socket.handshake.query.bot

      if (!botId) {
        socket.disconnect()
        return
      }

      pm2.connect((err) => {
        if (err) {
          console.error("Failed to connect to PM2:", err)
          socket.disconnect()
          return
        }

        pm2.describe(`bot-${botId}`, (err, processDescription) => {
          if (err) {
            console.error("Failed to get process description:", err)
            socket.disconnect()
            pm2.disconnect()
            return
          }

          if (processDescription.length === 0) {
            socket.disconnect()
            pm2.disconnect()
            return
          }

          const logFile = processDescription[0].pm2_env.pm_out_log_path

          const tail = require("tail").Tail
          const tailProcess = new tail(logFile)

          tailProcess.on("line", (data) => {
            socket.emit("log", data)
          })

          socket.on("disconnect", () => {
            tailProcess.unwatch()
            pm2.disconnect()
          })
        })
      })
    })
  }

  res.end()
}


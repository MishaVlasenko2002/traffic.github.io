import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { PrismaClient } from "@prisma/client"
import formidable from "formidable"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: false,
  },
}

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

  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to parse form" })
    }

    const file = files.file as formidable.File
    const oldPath = file.filepath
    const newPath = path.join(process.cwd(), "bots", bot.id.toString(), "index.js")

    fs.copyFile(oldPath, newPath, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save file" })
      }

      // Here you can add code validation logic

      res.status(200).json({ message: "File uploaded successfully" })
    })
  })
}


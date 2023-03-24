import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let page = req.query.afterID;
  let post = req.query.post;

  if (typeof post !== "string")
    return res.send({
      e: "Invalid query",
    });

  let qr = {
    ...{
      orderBy: {
        time: "desc",
      },
      take: 30,
      select: {
        time: false,
        belongsTo: false,
        content: true,
        id: true,
        ip: false,
      },
      where: {
        belongsTo: post,
      },
    },
    ...(page
      ? {
          cursor: {
            id: page,
          },
          skip: 1,
        }
      : {}),
  };

  res.send(await prismadb.chat.findMany(qr as any));
}

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { getClientIp } from "request-ip";
import cookieAdmin from "@/utils/isthiscookieadmin";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let page = req.query.afterID;
  let post = req.query.post;
  let userip = getClientIp(req) || "Unknown";
  let isAdmin = await cookieAdmin(req.cookies["token"]);

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
        ip: true,
        isShown: isAdmin,
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
    ...(!isAdmin
      ? {
          where: {
            belongsTo: post,
            isShown: true,
          },
        }
      : {}),
  };

  let outdt = (await prismadb.chat.findMany(qr as any)).map((i) => {
    let rt: { [key: string]: any } = {
      content: i.content,
      id: i.id,
      isFromMe: i.ip == userip,
      isShown: false,
    };
    if (i.isShown) rt["isShown"] = i.isShown;
    return rt;
  });

  res.send(outdt);
}

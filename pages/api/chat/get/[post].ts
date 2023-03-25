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

  if (typeof post !== "string")
    return res.send({
      e: "Invalid query",
    });

  console.log(post);

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
      },
      where: {
        belongsTo: post,
        isShown: true,
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

  console.log(qr);

  res.send(
    (await prismadb.chat.findMany(qr as any)).map((i) => {
      console.log(userip, i.ip);
      return {
        time: i.time,
        belongsTo: i.belongsTo,
        content: i.content,
        id: i.id,
        isFromMe: i.ip == userip,
      };
    })
  );
}

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { serialize } from "cookie";
import { getClientIp } from "request-ip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const checkAdmined = async () => {
    let cok = req.cookies["token"];
    if (typeof cok !== "string") return false;
    let cn = await prismadb.keyVal.count({
      where: {
        key: "admin",
        val: cok,
      },
    });
    if (cn == 0) {
      res
        .setHeader(
          "Set-Cookie",
          serialize("token", "", {
            maxAge: -1,
            path: "/",
          })
        )
        .send({
          s: false,
        });
      return false;
    }
    return true;
  };

  const invalid_d = () => {
    return res.send({
      e: "Invalid Query/Body",
    });
  };

  let slugs = req.query.slug as string[];
  if (slugs.length == 0)
    return res.status(404).send({
      e: "404",
    });

  const handlers: { [key: string]: () => Promise<any> } = {
    "post/delete": async () => {
      let postId = req.query.postId;
      if (typeof postId !== "string") return invalid_d();

      let postIp = await prismadb.post.findFirst({
        where: {
          id: postId,
        },
        select: {
          content: false,
          id: false,
          ip: true,
          isShown: false,
          time: false,
          title: false,
          view: false,
        },
      });
      if (postIp == null) return invalid_d();
      if (await checkAdmined()) {
        await prismadb.post.delete({
          where: {
            id: postId,
          },
        });
        await prismadb.chat.deleteMany({
          where: {
            belongsTo: postId,
          },
        });
        return res.send({
          s: true,
        });
      }
      if (getClientIp(req) == postIp.ip) {
        await prismadb.post.update({
          where: {
            id: postId,
          },
          data: {
            isShown: false,
          },
        });
        return res.send({
          s: true,
        });
      }
      return res.send({
        e: "관리자 인증에 실패하였습니다.",
      });
    },
    "chat/delete": async () => {
      let postId = req.query.chatId;
      if (typeof postId !== "string") return invalid_d();

      let postIp = await prismadb.chat.findFirst({
        where: {
          id: postId,
        },
        select: {
          ip: true,
        },
      });
      if (postIp == null) return invalid_d();
      if (await checkAdmined()) {
        await prismadb.chat.delete({
          where: {
            id: postId,
          },
        });
        return res.send({
          s: true,
        });
      }
      if (getClientIp(req) == postIp.ip) {
        await prismadb.chat.update({
          where: {
            id: postId,
          },
          data: {
            isShown: false,
          },
        });
        return res.send({
          s: true,
        });
      }
      return res.send({
        e: "관리자 인증에 실패하였습니다.",
      });
    },
  };

  let path = slugs.join("/");
  if (handlers[path]) return await handlers[path]();
  else
    return res.status(404).send({
      e: "404",
    });
}

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let cok = req.cookies["token"];
  if (typeof cok !== "string")
    return res.send({
      e: "관리자 인증에 실패하였습니다.",
    });
  let cn = await prismadb.keyVal.count({
    where: {
      key: "admin",
      val: cok,
    },
  });
  console.log(cok);
  if (cn == 0)
    return res
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
    },
  };

  let path = slugs.join("/");
  if (handlers[path]) return await handlers[path]();
  else
    return res.status(404).send({
      e: "404",
    });
}

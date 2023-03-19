// url exmaple
// /api/post/get?id=213897123789123987
// res example
/*
{
  "e": "Post not found"
}
*/
/*
{
  "id": "end",
  "title": "마지막 글이에요",
  "content": "<p></p>",
  "time": "2023-03-19T04:42:44.421Z",
  "view": 0
}
*/
/*
{
  "e": "ID is not a string"
}
*/

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let id = req.query.id;
  if (typeof id !== "string")
    return res.send({
      e: "ID is not a string",
    });

  return res.send(
    (await prismadb.post.findUnique({
      where: {
        id: id,
      },
      select: {
        isShown: false,
        ip: false,
        id: true,
        title: true,
        content: true,
        time: true,
        view: true,
      },
    })) || {
      e: "Post not found",
    }
  );
}

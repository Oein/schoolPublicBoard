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
import cookieAdmin from "@/utils/isthiscookieadmin";
import { getClientIp } from "request-ip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let id = req.query.id;
  let ip = getClientIp(req) || "Unknown";
  if (typeof id !== "string")
    return res.send({
      e: "ID is not a string",
    });

  let post = await prismadb.post.findFirst({
    where: {
      id: id,
      isShown: false,
    },
    select: {
      isShown: false,
      ip: true,
      id: true,
      title: true,
      content: true,
      time: true,
      view: true,
      type: true,
    },
  });

  if (!post)
    return res.send(
      post || {
        e: "Post not found",
      }
    );

  let isadmin = await cookieAdmin(req.cookies["token"]);

  const isPostShowable = (
    postType: number,
    myIp: string,
    postIp: string,
    isadmin: boolean
  ) => {
    if (postType == 100) return true;
    if (postType == 200) return true;
    if (postType == 101) return isadmin || myIp == postIp;
    if (postType == 201) return isadmin || myIp == postIp;
    return false;
  };

  if (isPostShowable(post.type, ip, post.ip, isadmin))
    return res.send({
      ip: post.ip,
      id: post.id,
      title: post.title,
      content: post.content,
      time: post.time,
      view: post.view,
    });

  return res.send({
    e: "No permission to view this post",
  });
}

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import kensorship from "kensorship";
import { uid } from "uid";
import { getClientIp } from "request-ip";
import cookieAdmin from "@/utils/isthiscookieadmin";

// Req body
/*
{
    content: string;
    title: string;
}
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(404).redirect("/api/404");
  let content = req.body.content;
  let title = req.body.title;
  let postType = req.body.type;
  let ip = getClientIp(req);

  const invalid_body = () => {
    return res.status(400).send({
      e: "요청이 잘못되었습니다.",
    });
  };
  console.log(postType, title, content);
  if (typeof content !== "string") return invalid_body();
  if (typeof title !== "string") return invalid_body();
  if (typeof ip !== "string") return invalid_body();
  if (typeof postType !== "number") return invalid_body();

  if (content.length == 0) return invalid_body();
  if (title.length == 0) return invalid_body();

  let tagIncludeds = ["<button", "<script", "<img", "<video", "<style"].map(
    (i) => content.includes(i)
  );
  let tagIncluded = false;
  tagIncludeds.forEach((i) => (i ? (tagIncluded = true) : null));
  if (tagIncluded) return invalid_body();

  if (title.includes("공지"))
    return res.status(400).send({
      e: "`제목은 '공지'를 포함할 수 없습니다.`",
    });

  if (postType == 300 && !(await cookieAdmin(req.cookies["token"])))
    return res.send({
      e: "관리자 인증에 실패하였습니다.",
    });
  if (kensorship(content).length > 0)
    return res.send({
      e: "Exsist bad words",
    });
  if (kensorship(title).length > 0)
    return res.send({
      e: "Exsist bad words",
    });

  let idu = uid(64);
  await prismadb.post.create({
    data: {
      content: content,
      id: idu,
      ip: ip,
      title: title,
      isShown: true,
      view: 0,
      time: new Date(),
      type: postType || 100,
    },
  });

  res.send({
    s: idu,
  });
}

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import kensorship from "kensorship";
import { uid } from "uid";

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
  let ip = req.headers["x-original-forwarded-for"] || req.socket.remoteAddress;

  const invalid_body = () => {
    return res.status(400).send({
      e: "요청이 잘못되었습니다.",
    });
  };
  if (typeof content !== "string") return invalid_body();
  if (typeof title !== "string") return invalid_body();
  if (typeof ip !== "string") return invalid_body();

  if (content.length == 0) return invalid_body();
  if (title.length == 0) return invalid_body();

  let tagIncludeds = ["<button", "<script", "<img", "<video", "<style"].map(
    (i) => content.includes(i)
  );
  let tagIncluded = false;
  tagIncludeds.forEach((i) => (i ? (tagIncluded = true) : null));
  if (tagIncluded) return invalid_body();

  if (kensorship(content).length > 0)
    return res.send({
      e: "Exsist bad words",
    });
  if (kensorship(title).length > 0)
    return res.send({
      e: "Exsist bad words",
    });

  await prismadb.post.create({
    data: {
      content: content,
      id: uid(64),
      ip: ip,
      title: title,
      isShown: true,
      view: 0,
      time: new Date(),
    },
  });

  res.send({
    s: true,
  });
}
import * as path from "node:path";
import * as process from "node:process";
import * as fs from "node:fs";
import matter from "gray-matter";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";

// Use remark to convert markdown into HTML string
const processor = unified()
  .use(remarkGfm)
  .use(remarkGithub)
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeExternalLinks, { rel: ["nofollow"] })
  .use(rehypeStringify);

export async function loadRes(slug: string): Promise<Record<string, string>> {
  const fullPath = path.join(process.cwd(), "docs", "res", `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const processedContent = await processor.process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...matterResult.data,
  };
}

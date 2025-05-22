/// <reference lib="deno.ns" />
import { Handlers } from "$fresh/server.ts";

// Interface for the post data
interface PostData {
  slug?: string;
  title: string;
  tags: string[];
  category: string;
  content: string;
}

// Export the POST function directly for testability
export async function POST(req: Request, _ctx?: unknown): Promise<Response> {
  console.log("Draft API endpoint called");
  
  try {
    const data = await req.json() as PostData;
    const { slug, title, tags, category, content } = data;
    
    console.log("Received draft data:", { slug, title, tags, category, contentLength: content?.length || 0 });
    
    // Validate required fields
    if (!title || !content) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    try {
      // Make sure the site/src directories exist
      const siteDir = "../site";
      const srcDir = siteDir + "/src";
      const postsDir = srcDir + "/posts";
      const draftsDir = postsDir + "/_drafts";
      
      console.log("Creating directory path:", draftsDir);
      
      // Create each directory in sequence to ensure proper permissions
      await Deno.mkdir(siteDir, { recursive: true });
      await Deno.mkdir(srcDir, { recursive: true });
      await Deno.mkdir(postsDir, { recursive: true });
      await Deno.mkdir(draftsDir, { recursive: true });
      
      // Ensure we have a valid filename
      const fileName = slug || "draft-" + Date.now();
      const path = draftsDir + "/" + fileName + ".md";
      console.log("Writing draft to:", path);
      
      // Create the frontmatter
      const fmLines = [
        '---',
        `title: "${title}"`,
        `date: "${new Date().toISOString()}"`,
        `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]`,
        `category: "${category || 'Uncategorized'}"`,
        'draft: true',
        '---'
      ];
      const frontMatter = fmLines.join("\n") + "\n\n";
      
      // Write the file
      await Deno.writeTextFile(path, frontMatter + content);
      console.log("Draft successfully saved");
      
      return new Response(
        JSON.stringify({ 
          message: "Draft saved successfully!", 
          path: path 
        }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (dirError) {
      console.error("Error with file operations:", dirError);
      return new Response(
        JSON.stringify({ 
          error: "File system error", 
          details: dirError instanceof Error ? dirError.message : String(dirError)
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  } catch (error: unknown) {
    console.error("General error in draft endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save draft";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Export the handler for Fresh framework
export const handler: Handlers = {
  POST
};
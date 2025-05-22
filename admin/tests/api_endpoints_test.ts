import { assertEquals, assertExists } from "std/assert/mod.ts";
import * as draft from "../routes/api/draft.ts";
import * as publish from "../routes/api/publish.ts";
import { spy } from "./test_utils.ts";

// Create a mock request for testing API endpoints
function createMockRequest(url: string, method: string, body?: any): Request {
  const headers = new Headers({
    "Content-Type": "application/json"
  });
  
  const options: RequestInit = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return new Request(new URL(url, "http://localhost"), options);
}

// Mock the file system functions since we can't write to the file system in tests
const originalWriteTextFile = Deno.writeTextFile;
const originalReadTextFile = Deno.readTextFile;
const originalMkdir = Deno.mkdir;

function setupFilesystemMocks() {
  // @ts-ignore - mocking Deno.writeTextFile
  Deno.writeTextFile = spy(() => Promise.resolve());
  
  // @ts-ignore - mocking Deno.readTextFile
  Deno.readTextFile = spy(() => Promise.resolve("{}"));
  
  // @ts-ignore - mocking Deno.mkdir
  Deno.mkdir = spy(() => Promise.resolve());
}

function restoreFilesystemMocks() {
  // @ts-ignore - restoring Deno.writeTextFile
  Deno.writeTextFile = originalWriteTextFile;
  
  // @ts-ignore - restoring Deno.readTextFile
  Deno.readTextFile = originalReadTextFile;
  
  // @ts-ignore - restoring Deno.mkdir
  Deno.mkdir = originalMkdir;
}

Deno.test("POST /api/draft saves a draft", async () => {
  setupFilesystemMocks();
  
  const postData = {
    title: "Test Draft",
    slug: "test-draft",
    tags: ["test", "draft"],
    category: "Test",
    content: "<p>This is a test draft</p>"
  };
  
  const req = createMockRequest("/api/draft", "POST", postData);
  
  // Mock the ctx object
  const ctx = {
    params: {},
    state: {},
    render: () => new Response()
  };

  // Get the handler function and call it with our request
  const response = await draft.POST(req, ctx);
  
  assertExists(response);
  assertEquals(response.status, 200);
  
  // Verify response contains success message
  const responseData = await response.json();
  assertExists(responseData.message);
  
  // Verify writeTextFile was called (file is written)
  const writeTextFileSpy = Deno.writeTextFile as unknown as spy.Spy<typeof Deno.writeTextFile>;
  assertEquals(writeTextFileSpy.calls.length, 1);
  
  restoreFilesystemMocks();
});

Deno.test("POST /api/publish publishes a post", async () => {
  setupFilesystemMocks();
  
  const postData = {
    title: "Test Post",
    slug: "test-post",
    tags: ["test", "post"],
    category: "Test",
    content: "<p>This is a test post</p>"
  };
  
  const req = createMockRequest("/api/publish", "POST", postData);
  
  // Mock the ctx object
  const ctx = {
    params: {},
    state: {},
    render: () => new Response()
  };

  // Get the handler function and call it with our request
  const response = await publish.POST(req, ctx);
  
  assertExists(response);
  assertEquals(response.status, 200);
  
  // Verify response contains success message
  const responseData = await response.json();
  assertExists(responseData.message);
  
  // Verify writeTextFile was called (file is written)
  const writeTextFileSpy = Deno.writeTextFile as unknown as spy.Spy<typeof Deno.writeTextFile>;
  assertEquals(writeTextFileSpy.calls.length, 1);
  
  restoreFilesystemMocks();
});

Deno.test("POST /api/draft handles invalid request", async () => {
  setupFilesystemMocks();
  
  // Missing required fields
  const invalidData = {
    title: "Test Draft"
    // Missing other required fields
  };
  
  const req = createMockRequest("/api/draft", "POST", invalidData);
  
  // Mock the ctx object
  const ctx = {
    params: {},
    state: {},
    render: () => new Response()
  };

  // Get the handler function and call it with our request
  const response = await draft.POST(req, ctx);
  
  assertExists(response);
  assertEquals(response.status, 400);
  
  restoreFilesystemMocks();
});

Deno.test("POST /api/publish handles invalid request", async () => {
  setupFilesystemMocks();
  
  // Missing required fields
  const invalidData = {
    title: "Test Post"
    // Missing other required fields
  };
  
  const req = createMockRequest("/api/publish", "POST", invalidData);
  
  // Mock the ctx object
  const ctx = {
    params: {},
    state: {},
    render: () => new Response()
  };

  // Get the handler function and call it with our request
  const response = await publish.POST(req, ctx);
  
  assertExists(response);
  assertEquals(response.status, 400);
  
  restoreFilesystemMocks();
});
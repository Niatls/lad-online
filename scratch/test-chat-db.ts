import { db } from "./src/lib/db.js";

async function test() {
  try {
    console.log("Checking DB connection...");
    const count = await db.chatSession.count();
    console.log("Session count:", count);
    
    console.log("Trying to find or create a test session...");
    const visitorId = "test_visitor_" + Date.now();
    const session = await db.chatSession.create({
      data: { visitorId, visitorName: "Tester" }
    });
    console.log("Created session:", session.id);
    
    console.log("Trying to create a message...");
    const message = await db.chatMessage.create({
      data: { sessionId: session.id, content: "Hello from test script", sender: "visitor" }
    });
    console.log("Created message:", message.id);
    
    console.log("Cleanup...");
    await db.chatMessage.delete({ where: { id: message.id } });
    await db.chatSession.delete({ where: { id: session.id } });
    console.log("Test successful!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}

test();

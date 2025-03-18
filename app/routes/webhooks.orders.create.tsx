import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // Verify the webhook request
    //const { admin } = await authenticate.admin(request);

    // Read the webhook payload
    const body = await request.json();
    console.log("📦 New Order Received:", JSON.stringify(body, null, 2));

    // Send JSON to Spring Boot
    const response = await fetch("http://localhost:8080/order-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to send data to Spring Boot: ${response.statusText}`);
      }

    return json({ success: true });
  } catch (error) {
    console.error("🚨 Webhook Error:", error);
    return json({ error: "Failed to process webhook" }, { status: 500 });
  }
};

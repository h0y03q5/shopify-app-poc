import "dotenv/config";
import fetch from "node-fetch";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-01"; // Update to your API version

async function listWebhooks() {
  try {
    const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/webhooks.json`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📌 Registered Webhooks:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("🚨 Error fetching webhooks:", error);
  }
}

// Run the function
listWebhooks();

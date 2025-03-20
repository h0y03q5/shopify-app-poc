import "dotenv/config";
import fetch from "node-fetch";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-01"; // Update to your API version

async function deleteWebhook(webhookId) {
  try {
    const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/webhooks/${webhookId}.json`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`✅ Webhook with ID ${webhookId} deleted successfully!`);
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("🚨 Error deleting webhook:", error);
  }
}

// Run the function (Replace with actual webhook ID)
const webhookId = "1697300807972"; // Replace this with the actual webhook ID using listWebhooks.js
deleteWebhook(webhookId);

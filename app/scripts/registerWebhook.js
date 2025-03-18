import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const SHOPIFY_ADMIN_API_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2025-01/graphql.json`;

const REGISTER_WEBHOOK_QUERY = `
  mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
      }
    }
  }
`;

async function registerWebhook() {
  const response = await fetch(SHOPIFY_ADMIN_API_URL, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: REGISTER_WEBHOOK_QUERY,
      variables: {
        topic: "ORDERS_CREATE",
        webhookSubscription: {
          callbackUrl: `${process.env.SHOPIFY_APP_URL}/webhooks/orders/create`,
          format: "JSON",
        },
      },
    }),
  });

  const data = await response.json();
  console.log("🔗 Webhook Registration Response:", JSON.stringify(data, null, 2));
}

registerWebhook();

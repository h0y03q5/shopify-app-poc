import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "generateProduct") {
    const color = ["Red", "Orange", "Yellow", "Green"][
      Math.floor(Math.random() * 4)
    ];
    const response = await admin.graphql(
      `#graphql
        mutation populateProduct($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              title
              status
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }`,
      { variables: { product: { title: `${color} Snowboard` } } }
    );

    const responseJson = await response.json();
    return { product: responseJson!.data!.productCreate!.product };
  }

  if (actionType === "fetchProducts") {
    const response = await admin.graphql(
      `#graphql
        {
          products(first: 10) {
            edges {
              node {
                id
                title
                status
                variants(first: 1) {
                  edges {
                    node {
                      price
                    }
                  }
                }
              }
            }
          }
        }`
    );

    const responseJson = await response.json();
    console.log("Fetched Products:", responseJson.data.products.edges);
    return { products: responseJson.data.products.edges };
  }

  if (actionType === "fetchOrders") {
    try {
      const response = await admin.graphql(
        `#graphql
        {
          orders(first: 10, reverse: true) {
            edges {
              node {
                id
                name
                totalPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                displayFulfillmentStatus
              }
            }
          }
        }`
      );
  
      const responseJson = await response.json();
      
      if (responseJson.errors) {
        console.error("GraphQL Errors:", responseJson.errors);
      }
  
      return { orders: responseJson.data.orders.edges };
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      return { error: "Failed to fetch orders." };
    }
  }

  return null;
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.products) {
      setProducts(fetcher.data.products);
    }
    if (fetcher.data?.orders) {
      setOrders(fetcher.data.orders);
    }
  }, [fetcher.data]);

  const generateProduct = () =>
    fetcher.submit({ actionType: "generateProduct" }, { method: "POST" });

  const fetchProducts = () =>
    fetcher.submit({ actionType: "fetchProducts" }, { method: "POST" });

  const fetchOrders = () =>
    fetcher.submit({ actionType: "fetchOrders" }, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Remix app template">
        <button variant="primary" onClick={generateProduct}>
          Generate a Product
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a Product
                  </Button>
                  <Button onClick={fetchProducts}>Fetch All Products</Button>
                  <Button onClick={fetchOrders}>Fetch All Orders</Button>
                </InlineStack>

                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      Product Created:
                    </Text>
                    <Box padding="400" background="bg-surface-active">
                      <pre>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}

                {products.length > 0 && (
                  <>
                    <Text as="h3" variant="headingMd">
                      All Products:
                    </Text>
                    <Box padding="400" background="bg-surface-active">
                      <ul>
                        {products.map(({ node }: any) => (
                          <li key={node.id}>
                            {node.title} - ${node.variants.edges[0]?.node.price}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </>
                )}

                {orders.length > 0 && (
                  <>
                    <Text as="h3" variant="headingMd">
                      All Orders:
                    </Text>
                    <Box padding="400" background="bg-surface-active">
                      <ul>
                        {orders.map(({ node }: any) => (
                          <li key={node.id}>
                            {node.name} - ${node.totalPrice} -{" "}
                            {node.fulfillmentStatus}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

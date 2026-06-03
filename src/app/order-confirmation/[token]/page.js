import OrderConfirmation from "@/app/OrderConfirmation";

export default async function OrderConfirmationPage({ params }) {
  const { token } = await params;
  return <OrderConfirmation token={token} />;
}

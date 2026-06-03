import OrderTracking from "@/app/OrderTracking";

export default async function TrackingPageWithToken({ params }) {
  const { token } = await params;
  return <OrderTracking token={token} />;
}

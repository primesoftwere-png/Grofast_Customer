import Orders from "@/app/Orders";

export default async function OrdersPageWithToken({ params }) {
  const { token } = await params;
  return <Orders token={token} />;
}

import { notFound, redirect } from "next/navigation";
import { getCachedOrderById } from "@/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import InstructionsClientWrapper from "./instructions-client-wrapper";

export const revalidate = 10;

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await getCachedOrderById(orderId);

  if (!order) {
    notFound();
  }

  const user = await getSessionUser();
  
  if (!user) {
    redirect(`/login?redirect=/order/instructions/${orderId}`);
  }

  if (order.user_id !== user.id && order.customer_email !== user.email) {
    notFound();
  }

  if (order.status === 'expired') {
    redirect(`/order/expired?orderId=${orderId}`);
  }

  if (order.expires_at && new Date(order.expires_at) < new Date()) {
    redirect(`/order/expired?orderId=${orderId}`);
  }

  return <InstructionsClientWrapper order={order} />;
}

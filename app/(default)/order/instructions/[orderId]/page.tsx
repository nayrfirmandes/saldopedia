import { notFound, redirect } from "next/navigation";
import { getCachedOrderById } from "@/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminPaymentConfig } from "@/lib/payment-config";
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

  // BUY orders should never expire - user already paid with saldo
  // Only SELL orders can expire if user hasn't uploaded proof
  const isBuyOrder = order.transaction_type === 'buy';
  const hasProofUploaded = !!order.proof_uploaded_at;
  
  if (order.expires_at && new Date(order.expires_at) < new Date()) {
    // Don't expire BUY orders - user already paid, just waiting for admin to process
    // Don't expire SELL orders if proof has been uploaded
    if (!isBuyOrder && !hasProofUploaded) {
      redirect(`/order/expired?orderId=${orderId}`);
    }
  }

  const paymentConfig = getAdminPaymentConfig();
  return <InstructionsClientWrapper order={order} paymentConfig={paymentConfig} />;
}

import { generateDummyTransaction } from "@/lib/dummy-transaction-generator";
import { getInstantSnapshot, getSnapshot, refreshSnapshot, type PriceSnapshot } from "@/lib/server-crypto-pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Transaction = {
  id: number;
  transactionId: string;
  userName: string;
  serviceType: string;
  cryptoSymbol: string | null;
  transactionType: string;
  amountIdr: string;
  amountForeign: string | null;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  completedAt: Date | null;
};

const connectionTransactions = new Map<string, {
  transactions: Transaction[];
  nextId: number;
  priceSnapshot: PriceSnapshot;
}>();

export async function GET() {
  const encoder = new TextEncoder();
  const connectionId = crypto.randomUUID();

  const initialSnapshot = getInstantSnapshot();
  
  getSnapshot();

  connectionTransactions.set(connectionId, {
    transactions: [],
    nextId: 1,
    priceSnapshot: initialSnapshot,
  });

  let generationInterval: NodeJS.Timeout | null = null;
  let statusUpdateInterval: NodeJS.Timeout | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;
  let priceRefreshInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error("Error sending event:", error);
        }
      };

      const generateAndSend = async () => {
        try {
          const connectionData = connectionTransactions.get(connectionId);
          if (!connectionData) return;

          const dummyData = await generateDummyTransaction(connectionData.priceSnapshot);
          
          const newTransaction: Transaction = {
            id: connectionData.nextId++,
            transactionId: dummyData.transactionId,
            userName: dummyData.userName,
            serviceType: dummyData.serviceType,
            cryptoSymbol: dummyData.cryptoSymbol || null,
            transactionType: dummyData.transactionType,
            amountIdr: dummyData.amountIdr,
            amountForeign: dummyData.amountForeign || null,
            status: "pending",
            paymentMethod: dummyData.paymentMethod,
            createdAt: new Date(),
            completedAt: null,
          };
          
          connectionData.transactions.unshift(newTransaction);
          
          if (connectionData.transactions.length > 5) {
            connectionData.transactions.pop();
          }
          
          sendEvent({ type: "new", transaction: newTransaction });
        } catch (error) {
          console.error("Error generating transaction:", error);
        }
      };

      const connectionData = connectionTransactions.get(connectionId);
      if (connectionData) {
        try {
          const dummyDataPromises = Array.from({ length: 5 }, () => 
            generateDummyTransaction(connectionData.priceSnapshot)
          );
          const dummyDataArray = await Promise.all(dummyDataPromises);
          
          dummyDataArray.forEach((dummyData, i) => {
            const tx: Transaction = {
              id: connectionData.nextId++,
              transactionId: dummyData.transactionId,
              userName: dummyData.userName,
              serviceType: dummyData.serviceType,
              cryptoSymbol: dummyData.cryptoSymbol || null,
              transactionType: dummyData.transactionType,
              amountIdr: dummyData.amountIdr,
              amountForeign: dummyData.amountForeign || null,
              status: "completed",
              paymentMethod: dummyData.paymentMethod,
              createdAt: new Date(Date.now() - (i * 2 * 60 * 1000)),
              completedAt: new Date(Date.now() - (i * 2 * 60 * 1000) + (5 * 60 * 1000)),
            };
            
            connectionData.transactions.push(tx);
            sendEvent({ type: "new", transaction: tx });
          });
        } catch (error) {
          console.error('Error generating initial transactions:', error);
        }
      }

      const updateTransactionStatus = async () => {
        try {
          const connectionData = connectionTransactions.get(connectionId);
          if (!connectionData) return;

          const now = Date.now();
          const fourSecondsAgo = new Date(now - 4000);
          const twelveSecondsAgo = new Date(now - 12000);
          
          const oldPending = connectionData.transactions.find(
            tx => tx.status === "pending" && new Date(tx.createdAt) < fourSecondsAgo
          );

          if (oldPending) {
            oldPending.status = "processing";
            
            if (controller.desiredSize && controller.desiredSize > 0) {
              sendEvent({ type: "status_update", transaction: oldPending });
            }
            return;
          }

          const oldProcessing = connectionData.transactions.find(
            tx => tx.status === "processing" && new Date(tx.createdAt) < twelveSecondsAgo
          );

          if (oldProcessing) {
            oldProcessing.status = "completed";
            oldProcessing.completedAt = new Date();
            
            if (controller.desiredSize && controller.desiredSize > 0) {
              sendEvent({ type: "status_update", transaction: oldProcessing });
            }
          }
        } catch (error) {
          console.error("Error updating transaction status:", error);
        }
      };

      generationInterval = setInterval(async () => {
        await generateAndSend();
      }, Math.random() * 10000 + 20000);

      statusUpdateInterval = setInterval(async () => {
        await updateTransactionStatus();
      }, 15000);

      keepAliveInterval = setInterval(() => {
        try {
          if (!controller.desiredSize || controller.desiredSize <= 0) {
            return;
          }
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (error) {
          console.error("Error sending keepalive:", error);
        }
      }, 30000);

      priceRefreshInterval = setInterval(async () => {
        try {
          const connectionData = connectionTransactions.get(connectionId);
          if (!connectionData) return;
          
          const refreshedSnapshot = await refreshSnapshot();
          connectionData.priceSnapshot = refreshedSnapshot;
        } catch (error) {
          console.error("Error refreshing price snapshot:", error);
        }
      }, 180000);
    },
    cancel() {
      if (generationInterval) {
        clearInterval(generationInterval);
        generationInterval = null;
      }
      if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
        statusUpdateInterval = null;
      }
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      if (priceRefreshInterval) {
        clearInterval(priceRefreshInterval);
        priceRefreshInterval = null;
      }
      
      connectionTransactions.delete(connectionId);
      console.log(`SSE connection ${connectionId} closed, intervals cleared`);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

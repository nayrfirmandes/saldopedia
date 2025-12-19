import { generateDummyTransaction, DynamicRatesConfig } from "@/lib/dummy-transaction-generator";
import { getInstantSnapshot, getSnapshot, refreshSnapshot, type PriceSnapshot } from "@/lib/server-crypto-pricing";
import { getDynamicRates } from "@/lib/dynamic-rates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Transaction = {
  id: number;
  transactionId: string;
  userName: string;
  serviceType: string;
  cryptoSymbol: string | null;
  cryptoNetwork: string | null;
  transactionType: string;
  amountIdr: string;
  amountForeign: string | null;
  status: string;
  createdAt: Date;
  walletAddress: string | null;
  maskedEmail: string | null;
};

const connectionTransactions = new Map<string, {
  transactions: Transaction[];
  nextId: number;
  priceSnapshot: PriceSnapshot;
  dynamicRates: DynamicRatesConfig;
}>();

export async function GET() {
  const encoder = new TextEncoder();
  const connectionId = crypto.randomUUID();

  const initialSnapshot = getInstantSnapshot();
  const initialRates = await getDynamicRates();
  
  getSnapshot();

  connectionTransactions.set(connectionId, {
    transactions: [],
    nextId: 1,
    priceSnapshot: initialSnapshot,
    dynamicRates: {
      cryptoConfig: initialRates.cryptoConfig,
      paypalRates: initialRates.paypalRates,
      skrillRates: initialRates.skrillRates,
    },
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

          const dummyData = await generateDummyTransaction(
            connectionData.priceSnapshot,
            connectionData.dynamicRates
          );
          
          const newTransaction: Transaction = {
            id: connectionData.nextId++,
            transactionId: dummyData.transactionId,
            userName: dummyData.userName,
            serviceType: dummyData.serviceType,
            cryptoSymbol: dummyData.cryptoSymbol || null,
            cryptoNetwork: dummyData.cryptoNetwork || null,
            transactionType: dummyData.transactionType,
            amountIdr: dummyData.amountIdr,
            amountForeign: dummyData.amountForeign || null,
            status: "pending",
            createdAt: new Date(),
            walletAddress: dummyData.walletAddress || null,
            maskedEmail: dummyData.maskedEmail || null,
          };
          
          connectionData.transactions.unshift(newTransaction);
          
          if (connectionData.transactions.length > 5) {
            const lastTx = connectionData.transactions[connectionData.transactions.length - 1];
            if (lastTx.status === "completed") {
              connectionData.transactions.pop();
            }
          }
          
          if (connectionData.transactions.length > 8) {
            connectionData.transactions = connectionData.transactions.slice(0, 8);
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
            generateDummyTransaction(connectionData.priceSnapshot, connectionData.dynamicRates)
          );
          const dummyDataArray = await Promise.all(dummyDataPromises);
          
          dummyDataArray.forEach((dummyData, i) => {
            const tx: Transaction = {
              id: connectionData.nextId++,
              transactionId: dummyData.transactionId,
              userName: dummyData.userName,
              serviceType: dummyData.serviceType,
              cryptoSymbol: dummyData.cryptoSymbol || null,
              cryptoNetwork: dummyData.cryptoNetwork || null,
              transactionType: dummyData.transactionType,
              amountIdr: dummyData.amountIdr,
              amountForeign: dummyData.amountForeign || null,
              status: "completed",
              createdAt: new Date(Date.now() - (i * 2 * 60 * 1000)),
              walletAddress: dummyData.walletAddress || null,
              maskedEmail: dummyData.maskedEmail || null,
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
          const threeSecondsAgo = new Date(now - 3000);
          const sixSecondsAgo = new Date(now - 6000);
          
          const oldPending = connectionData.transactions.find(
            tx => tx.status === "pending" && new Date(tx.createdAt) < threeSecondsAgo
          );

          if (oldPending) {
            oldPending.status = "processing";
            
            if (controller.desiredSize && controller.desiredSize > 0) {
              sendEvent({ type: "status_update", transaction: oldPending });
            }
            return;
          }

          const oldProcessing = connectionData.transactions.find(
            tx => tx.status === "processing" && new Date(tx.createdAt) < sixSecondsAgo
          );

          if (oldProcessing) {
            oldProcessing.status = "completed";
            
            if (controller.desiredSize && controller.desiredSize > 0) {
              sendEvent({ type: "status_update", transaction: oldProcessing });
            }
          }
        } catch (error) {
          console.error("Error updating transaction status:", error);
        }
      };

      const scheduleNextTransaction = () => {
        const delay = Math.random() * 8000 + 7000;
        generationInterval = setTimeout(async () => {
          await generateAndSend();
          scheduleNextTransaction();
        }, delay);
      };
      
      scheduleNextTransaction();

      statusUpdateInterval = setInterval(async () => {
        await updateTransactionStatus();
      }, 3000);

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
          
          const [refreshedSnapshot, refreshedRates] = await Promise.all([
            refreshSnapshot(),
            getDynamicRates()
          ]);
          
          connectionData.priceSnapshot = refreshedSnapshot;
          connectionData.dynamicRates = {
            cryptoConfig: refreshedRates.cryptoConfig,
            paypalRates: refreshedRates.paypalRates,
            skrillRates: refreshedRates.skrillRates,
          };
        } catch (error) {
          console.error("Error refreshing price/rates:", error);
        }
      }, 60000);
    },
    cancel() {
      if (generationInterval) {
        clearTimeout(generationInterval);
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

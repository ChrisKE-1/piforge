import { NextRequest, NextResponse } from "next/server";

/**
 * Called after the user signs the transaction on-device.
 * Complete the payment on Pi servers and update your DB / emit on-chain events.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, txid, taskId } = body;

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: "paymentId and txid required" },
        { status: 400 }
      );
    }

    // Production:
    // 1. Verify txid with Pi API
    // 2. Mark escrow as locked / released in your database
    // 3. Optionally call Soroban contract to record the settlement
    // 4. Update reputation if this was a release payment

    console.log(
      "[PiForge] Completing payment",
      paymentId,
      "txid",
      txid,
      "task",
      taskId
    );

    return NextResponse.json({
      success: true,
      paymentId,
      txid,
      message: "Payment completed (MVP stub)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Completion failed" },
      { status: 500 }
    );
  }
}

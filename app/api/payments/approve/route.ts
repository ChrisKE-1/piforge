import { NextRequest, NextResponse } from "next/server";

/**
 * Pi payment server approval endpoint.
 * In production:
 * 1. Verify the payment with Pi Platform API using your app credentials.
 * 2. Check that amount / metadata match the expected task escrow.
 * 3. Call Pi's approve endpoint.
 * 4. Return success so the client can proceed to completion.
 *
 * Docs: https://developers.minepi.com
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, taskId, expectedAmount } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId required" },
        { status: 400 }
      );
    }

    // --- Production checklist ---
    // const piApiKey = process.env.PI_API_KEY;
    // const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
    //   headers: { Authorization: `Key ${piApiKey}` },
    // });
    // const payment = await res.json();
    // Validate payment.amount === expectedAmount
    // Validate payment.metadata.taskId === taskId
    // Then approve:
    // await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    //   method: "POST",
    //   headers: { Authorization: `Key ${piApiKey}` },
    // });

    console.log("[PiForge] Approving payment", paymentId, "for task", taskId);

    return NextResponse.json({
      success: true,
      paymentId,
      message: "Payment approved (MVP stub – wire real Pi API in production)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Approval failed" },
      { status: 500 }
    );
  }
}

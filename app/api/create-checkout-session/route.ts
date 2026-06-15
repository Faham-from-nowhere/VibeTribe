import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getUrl } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

export async function POST(request: Request) {
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || "",
      email: user?.email || ""
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [
        {
          price: price.id,
          quantity
        }
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        metadata
      },
      success_url: `${getUrl()}/account`,
      cancel_url: `${getUrl()}`
    });

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url });
  } catch (error: any) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

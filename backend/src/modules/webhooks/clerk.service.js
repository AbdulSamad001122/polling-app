import User from "../../models/User.schema.js";

function primaryEmail(data) {
  const emails = data.email_addresses ?? [];
  const primaryId = data.primary_email_address_id;
  const entry = emails.find((e) => e.id === primaryId) ?? emails[0];
  return entry?.email_address ?? null;
}

export async function clerkWebhookService(event) {
  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const email = primaryEmail(data);
    if (!email) return;

    let user = await User.findOne({ clerkUserId: data.id });
    
    if (!user) {
      // Fallback: check if a user with this email already exists (e.g. from a previous failed sync)
      user = await User.findOne({ email });
    }

    if (user) {
      user.clerkUserId = data.id;
      user.firstName = data.first_name ?? "";
      user.lastName = data.last_name ?? "";
      user.email = email;
      user.imageUrl = data.image_url ?? "";
      await user.save();
    } else {
      user = await User.create({
        clerkUserId: data.id,
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        email,
        imageUrl: data.image_url ?? "",
      });
    }

    console.log("User created or updated:", user);
  }

  if (type === "user.deleted") {
    await User.deleteOne({ clerkUserId: data.id });
  }
}

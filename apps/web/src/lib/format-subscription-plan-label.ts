type SubscriptionPlanInfo = {
  planName?: string | null;
  durationMonths?: number | null;
};

/** dashboard label for the user's active plan tier */
export function formatSubscriptionPlanLabel(
  isPaidUser: boolean,
  subscription: SubscriptionPlanInfo | null | undefined,
): string {
  if (!isPaidUser) return "Free";

  if (subscription?.durationMonths === 48) return "Pro+";
  if (subscription?.durationMonths === 12) return "Pro";

  const planName = (subscription?.planName ?? "").toLowerCase();
  if (
    planName.includes("pro+") ||
    planName.includes("4 year") ||
    planName.includes("4-year") ||
    planName.includes("4yr")
  ) {
    return "Pro+";
  }

  if (planName === "pro") return "Pro";

  return "Pro";
}

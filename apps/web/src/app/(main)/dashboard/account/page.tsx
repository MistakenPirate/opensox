"use client";

import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { ActiveTag } from "@/components/ui/ActiveTag";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { formatSubscriptionPlanLabel } from "@/lib/format-subscription-plan-label";

const AccountPageContent = memo(function AccountPageContent({
  isPaidUser,
  subscription,
  onJoinDiscord,
  isCheckingDiscordStatus,
  isJoiningCommunity,
  hasJoinedCommunity,
  discordMessage,
  discordError,
}: {
  isPaidUser: boolean;
  subscription: {
    planName: string | null;
    durationMonths: number | null;
    startDate: Date;
    endDate: Date;
  } | null;
  onJoinDiscord: () => Promise<void>;
  isCheckingDiscordStatus: boolean;
  isJoiningCommunity: boolean;
  hasJoinedCommunity: boolean;
  discordMessage: string | null;
  discordError: string | null;
}) {
  const plan = useMemo(
    () => formatSubscriptionPlanLabel(isPaidUser, subscription),
    [isPaidUser, subscription],
  );
  const joinedOn = useMemo(() => {
    if (!subscription?.startDate) return "—";
    return new Date(subscription.startDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [subscription?.startDate]);

  const expiresOn = useMemo(() => {
    if (!subscription?.endDate) return "—";
    return new Date(subscription.endDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [subscription?.endDate]);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/home"
          className="inline-flex items-center gap-2 text-brand-purple-light hover:text-brand-purple transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
          Account Settings
        </h1>
      </div>

      <div className="bg-ox-sidebar border border-dash-border rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-2 block">Plan</label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-text-primary">
                {plan}
              </span>
              {isPaidUser && <ActiveTag />}
            </div>
          </div>
          {isPaidUser && (
            <>
              <div>
                <label className="text-sm text-text-muted mb-2 block">
                  Joined on
                </label>
                <p className="text-text-primary text-sm font-medium">{joinedOn}</p>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-2 block">
                  Expires on
                </label>
                <p className="text-text-primary text-sm font-medium">{expiresOn}</p>
              </div>
            </>
          )}
          {!isPaidUser && (
            <div>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-3 py-1.5 bg-ox-purple hover:bg-ox-purple-2 text-text-primary rounded-md transition-colors text-xs font-medium"
              >
                be a pro
              </Link>
            </div>
          )}
          {isPaidUser && (
            <div className="pt-4 border-t border-dash-border">
              <p className="text-sm text-text-muted mb-3">Discord Community</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void onJoinDiscord()}
                  disabled={
                    isJoiningCommunity || isCheckingDiscordStatus || hasJoinedCommunity
                  }
                  className="inline-flex items-center justify-center px-3 py-1.5 bg-brand-purple hover:bg-brand-purple-light text-text-primary rounded-md transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingDiscordStatus
                    ? "Checking..."
                    : hasJoinedCommunity
                      ? "Joined"
                      : isJoiningCommunity
                        ? "Redirecting..."
                        : "Join"}
                </button>
              </div>
              {discordError && (
                <p className="text-error-text text-xs mt-2">{discordError}</p>
              )}
              {discordMessage && (
                <p className="text-success-text text-xs mt-2">{discordMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default function AccountPage() {
  const { isPaidUser, isLoading, subscription } = useSubscription();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isCheckingDiscordStatus, setIsCheckingDiscordStatus] = useState(false);
  const [isJoiningCommunity, setIsJoiningCommunity] = useState(false);
  const [hasJoinedCommunity, setHasJoinedCommunity] = useState(false);
  const [discordError, setDiscordError] = useState<string | null>(null);
  const [discordMessage, setDiscordMessage] = useState<string | null>(
    searchParams.get("discord") === "joined"
      ? "Joined pro community successfully."
      : null
  );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getAccessToken = (): string | null => {
    const accessToken = (session as Session)?.accessToken;
    if (!accessToken) {
      setDiscordError("Authentication token not found");
      return null;
    }
    return accessToken;
  };

  const handleJoinCommunity = async (): Promise<void> => {
    if (isJoiningCommunity) return;
    setIsJoiningCommunity(true);
    setDiscordError(null);
    setDiscordMessage(null);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsJoiningCommunity(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/discord/connect-url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setDiscordError(data.error || "Failed to start Discord connection");
        return;
      }

      if (!data.authUrl) {
        setDiscordError("Discord authorization URL not available");
        return;
      }

      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Discord connect failed:", error);
      setDiscordError("Failed to connect Discord");
    } finally {
      setIsJoiningCommunity(false);
    }
  };

  useEffect(() => {
    const loadDiscordStatus = async () => {
      if (!isPaidUser || !session?.user) {
        setHasJoinedCommunity(false);
        return;
      }

      const accessToken = (session as Session)?.accessToken;
      if (!accessToken) {
        return;
      }

      setIsCheckingDiscordStatus(true);
      try {
        const response = await fetch(`${apiUrl}/discord/community-status`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setHasJoinedCommunity(Boolean(data.joined));
      } catch (error) {
        console.error("Failed to load Discord community status:", error);
      } finally {
        setIsCheckingDiscordStatus(false);
      }
    };

    void loadDiscordStatus();
  }, [apiUrl, isPaidUser, session]);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-ox-content">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-text-muted">Loading...</span>
        </div>
      ) : (
        <AccountPageContent
          isPaidUser={isPaidUser}
          subscription={subscription}
          onJoinDiscord={handleJoinCommunity}
          isCheckingDiscordStatus={isCheckingDiscordStatus}
          isJoiningCommunity={isJoiningCommunity}
          hasJoinedCommunity={hasJoinedCommunity}
          discordMessage={discordMessage}
          discordError={discordError}
        />
      )}
    </div>
  );
}

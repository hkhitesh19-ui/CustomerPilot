-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'merchant',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantIdNumber" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "businessType" TEXT,
    "ownerName" TEXT,
    "address" TEXT,
    "businessTiming" TEXT,
    "category" TEXT,
    "city" TEXT,
    "googleReviewLink" TEXT,
    "baselineReviewCount" INTEGER DEFAULT 0,
    "baselineRating" REAL DEFAULT 0.0,
    "baselineScreenshotUrl" TEXT,
    "baselineCapturedAt" DATETIME,
    "timezone" TEXT,
    "whatsappPhone" TEXT,
    "whatsappInstanceName" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "plan" TEXT DEFAULT 'trial',
    "status" TEXT DEFAULT 'active',
    "trialEndsAt" DATETIME,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "googleReviewDelayMinutes" INTEGER NOT NULL DEFAULT 30,
    "vipUpgradeBonusStamps" INTEGER NOT NULL DEFAULT 1,
    "loyaltyCategoryNames" TEXT,
    "winbackDays1" INTEGER NOT NULL DEFAULT 30,
    "winbackDays2" INTEGER NOT NULL DEFAULT 60,
    "winbackDays3" INTEGER NOT NULL DEFAULT 90,
    "expiryWarningDays" INTEGER NOT NULL DEFAULT 7,
    "almostThereInactivityDays" INTEGER NOT NULL DEFAULT 7,
    "enabledModules" TEXT NOT NULL DEFAULT 'LOYALTY,REVIEWS,AUTOREPLY',
    "showPoweredBy" BOOLEAN NOT NULL DEFAULT true,
    "ctaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "merchantReferralCode" TEXT,
    "walletCredit" INTEGER NOT NULL DEFAULT 0,
    "communityUrl" TEXT,
    "gbpServiceTrack" TEXT DEFAULT 'NONE',
    "gbpProfileStatus" TEXT DEFAULT 'UNVERIFIED',
    "gbpOnboardingWeek" INTEGER DEFAULT 0,
    "gbpReviewCount" INTEGER DEFAULT 0,
    "gbpReviewVelocityCap" INTEGER DEFAULT 3,
    "gbpCitationsReady" BOOLEAN DEFAULT false,
    "gbpSurgeryCompleted" BOOLEAN DEFAULT false,
    "gbpMapTrafficEnabled" BOOLEAN DEFAULT false,
    "gbpLastReportSentAt" DATETIME,
    "gbpTrackStartedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentNo" TEXT NOT NULL,
    "merchantId" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "rootCause" TEXT,
    "resolution" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "pin" TEXT,
    "role" TEXT NOT NULL,
    "requireManagerApprovalUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Staff_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "referralCode" TEXT,
    "acquisitionChan" TEXT,
    "notes" TEXT,
    "lifetimeStamps" INTEGER NOT NULL DEFAULT 0,
    "lifetimeSpend" REAL NOT NULL DEFAULT 0,
    "lifetimeRedemptions" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "birthday" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "vipTier" TEXT DEFAULT 'none',
    "botState" TEXT NOT NULL DEFAULT 'IDLE',
    "botStateUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" DATETIME,
    "status" TEXT,
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT true,
    "walletCredit" INTEGER NOT NULL DEFAULT 0,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Customer_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Customer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StampCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stampsRequired" INTEGER NOT NULL,
    "rewardName" TEXT NOT NULL,
    "stampsPerBill" TEXT,
    "color" TEXT,
    "rewardImageUrl" TEXT,
    "stampValue" REAL,
    "validityDays" INTEGER,
    "googleReviewBonus" INTEGER,
    "photoBonus" INTEGER,
    "joiningBonusEnabled" BOOLEAN NOT NULL DEFAULT true,
    "joiningBonusStamps" INTEGER NOT NULL DEFAULT 2,
    "tierRewardsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "excludedCategories" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StampCard_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerStampCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "stampCardId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "stampsCollected" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerStampCard_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomerStampCard_stampCardId_fkey" FOREIGN KEY ("stampCardId") REFERENCES "StampCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomerStampCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stamp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "stampCardId" TEXT,
    "customerStampCardId" TEXT,
    "merchantId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "billId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "Stamp_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Stamp_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stamp_customerStampCardId_fkey" FOREIGN KEY ("customerStampCardId") REFERENCES "CustomerStampCard" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Stamp_stampCardId_fkey" FOREIGN KEY ("stampCardId") REFERENCES "StampCard" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Stamp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stampsCost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresManagerApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Reward_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "stampsAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bill_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bill_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "approvedById" TEXT,
    "stampsSpent" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Redemption_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Redemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Redemption_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "friendPhone" TEXT NOT NULL,
    "friendCustomerId" TEXT,
    "status" TEXT NOT NULL,
    "bonusStampsReferrer" INTEGER NOT NULL DEFAULT 0,
    "bonusStampsFriend" INTEGER NOT NULL DEFAULT 0,
    "rewardType" TEXT,
    "rewardAmount" INTEGER NOT NULL DEFAULT 50,
    "qualifyingEvent" TEXT,
    "flaggedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_friendCustomerId_fkey" FOREIGN KEY ("friendCustomerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Referral_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT,
    "toPhone" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metaMessageId" TEXT,
    "sentAt" DATETIME,
    "errorMessage" TEXT,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "scheduledFor" DATETIME,
    CONSTRAINT "WhatsAppMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppMessage_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "staffId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planKey" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "days" INTEGER NOT NULL DEFAULT 30,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "discountPercent" INTEGER DEFAULT 0,
    "badge" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "features" TEXT NOT NULL,
    "enabledModules" TEXT NOT NULL DEFAULT 'LOYALTY,REVIEWS,AUTOREPLY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'percent',
    "discountValue" REAL NOT NULL,
    "minOrderAmount" REAL DEFAULT 0,
    "maxDiscount" REAL,
    "maxUses" INTEGER DEFAULT 100,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "validUntil" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "renewalDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "platform" TEXT DEFAULT 'google',
    "rating" INTEGER NOT NULL,
    "aiDraft" TEXT,
    "finalText" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL,
    "bonusStampsAwarded" INTEGER NOT NULL DEFAULT 0,
    "photoBonusStamps" INTEGER NOT NULL DEFAULT 0,
    "requestSource" TEXT,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Birthday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER NOT NULL,
    "vipTier" TEXT,
    "rewardName" TEXT NOT NULL,
    "bonusStamps" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "rewardWindowStart" DATETIME,
    "rewardWindowEnd" DATETIME,
    "reminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Birthday_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Birthday_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VipTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minLifetimeSpend" REAL NOT NULL,
    "perks" TEXT NOT NULL,
    "bonusMultiplier" REAL NOT NULL DEFAULT 1.0,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VipTier_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WinBackEscalation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "sentAt" DATETIME,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WinBackEscalation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WinBackEscalation_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Achievement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "resolution" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "label" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingStep_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitingCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" DATETIME,
    "claimedById" TEXT,
    "amount" REAL,
    "stampsAwarded" INTEGER,
    "expiresAt" DATETIME NOT NULL,
    "scanSource" TEXT,
    "reservedAt" DATETIME,
    "reservedById" TEXT,
    "reservationExpiresAt" DATETIME,
    "undoWindowUntil" DATETIME,
    "recoveredAt" DATETIME,
    "recoveredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaitingCustomer_recoveredById_fkey" FOREIGN KEY ("recoveredById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaitingCustomer_reservedById_fkey" FOREIGN KEY ("reservedById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaitingCustomer_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaitingCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaitingCustomer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FraudAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FraudAlert_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerMergeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerMergeLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchantTransferLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "oldOwnerId" TEXT,
    "legalAttestation" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantTransferLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardWaitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardWaitlist_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardRuleChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardRuleChangeLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignDeliveryLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignDeliveryLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OwnerOverrideLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "ownerStaffId" TEXT,
    "customerId" TEXT,
    "monthKey" TEXT,
    "overrideType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OwnerOverrideLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchantGoogleConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "placeId" TEXT,
    "placeName" TEXT,
    "address" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionType" TEXT DEFAULT 'oauth',
    "gbpAccountId" TEXT,
    "gbpLocationId" TEXT,
    "googleReviewUrl" TEXT,
    "oauthAccessToken" TEXT,
    "oauthRefreshToken" TEXT,
    "oauthTokenExpiry" DATETIME,
    CONSTRAINT "MerchantGoogleConnection_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OTPSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "messageId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "deliveryStatus" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DeadLetterQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT,
    "originalTable" TEXT,
    "originalId" TEXT,
    "payload" TEXT NOT NULL,
    "error" TEXT,
    "errorReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "willExpireAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GoogleBusinessReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "gbpReviewId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewReply" TEXT,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GoogleBusinessReview_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BackgroundJob_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT,
    "templateKey" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'MARKETING',
    "messageBody" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "variables" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "MessageTemplate_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateVersionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "messageBody" TEXT NOT NULL,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateVersionHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchantReferral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerMerchantId" TEXT NOT NULL,
    "referredMerchantId" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredEmail" TEXT,
    "referredPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "referrerReward" INTEGER NOT NULL DEFAULT 100,
    "referredReward" INTEGER NOT NULL DEFAULT 100,
    "qualifyingEvent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" DATETIME,
    "rewardedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchantReferral_referrerMerchantId_fkey" FOREIGN KEY ("referrerMerchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MerchantReferral_referredMerchantId_fkey" FOREIGN KEY ("referredMerchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrowthSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "snapshotDate" DATETIME NOT NULL,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalStamps" INTEGER NOT NULL DEFAULT 0,
    "totalRedemptions" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "repeatVisits" INTEGER NOT NULL DEFAULT 0,
    "googleReviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrowthSnapshot_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrowthReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "reportMonth" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "stampsIssued" INTEGER NOT NULL DEFAULT 0,
    "rewardsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "reviewsReceived" INTEGER NOT NULL DEFAULT 0,
    "repliesPosted" INTEGER NOT NULL DEFAULT 0,
    "repeatVisits" INTEGER NOT NULL DEFAULT 0,
    "shareImageUrl" TEXT,
    "sharedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrowthReport_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewBonusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "reviewId" TEXT,
    "reviewerName" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "photoUri" TEXT,
    "matchConfidence" REAL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "recheckScheduled" BOOLEAN NOT NULL DEFAULT false,
    "recheckAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "finalizedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewBonusLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewBonusLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DigitalBusinessCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'champagne_luxury',
    "displayName" TEXT NOT NULL,
    "subCategories" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "locationShort" TEXT,
    "locationState" TEXT,
    "businessHours" TEXT,
    "deliveryInfo" TEXT,
    "whatsappNumber" TEXT,
    "phoneNumber" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "googleMapsUrl" TEXT,
    "websiteUrl" TEXT,
    "orderingLinks" TEXT DEFAULT '[]',
    "googleRating" REAL DEFAULT 4.6,
    "googleReviewsCnt" INTEGER DEFAULT 689,
    "googlePlaceId" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "contactSaves" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigitalBusinessCard_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GbpChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "taskKey" TEXT NOT NULL,
    "taskLabel" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" DATETIME,
    "doneByEmail" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GbpChecklistItem_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchantIdNumber_key" ON "Merchant"("merchantIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_key" ON "Merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_whatsappPhone_key" ON "Merchant"("whatsappPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchantReferralCode_key" ON "Merchant"("merchantReferralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incidentNo_key" ON "Incident"("incidentNo");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");

-- CreateIndex
CREATE INDEX "Staff_merchantId_idx" ON "Staff"("merchantId");

-- CreateIndex
CREATE INDEX "Customer_merchantId_idx" ON "Customer"("merchantId");

-- CreateIndex
CREATE INDEX "Customer_merchantId_phone_idx" ON "Customer"("merchantId", "phone");

-- CreateIndex
CREATE INDEX "Customer_merchantId_status_idx" ON "Customer"("merchantId", "status");

-- CreateIndex
CREATE INDEX "Customer_merchantId_lastActiveAt_idx" ON "Customer"("merchantId", "lastActiveAt");

-- CreateIndex
CREATE INDEX "Customer_merchantId_deletedAt_idx" ON "Customer"("merchantId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_merchantId_phone_key" ON "Customer"("merchantId", "phone");

-- CreateIndex
CREATE INDEX "StampCard_merchantId_idx" ON "StampCard"("merchantId");

-- CreateIndex
CREATE INDEX "CustomerStampCard_customerId_stampCardId_idx" ON "CustomerStampCard"("customerId", "stampCardId");

-- CreateIndex
CREATE INDEX "CustomerStampCard_merchantId_idx" ON "CustomerStampCard"("merchantId");

-- CreateIndex
CREATE INDEX "Stamp_customerId_idx" ON "Stamp"("customerId");

-- CreateIndex
CREATE INDEX "Stamp_merchantId_idx" ON "Stamp"("merchantId");

-- CreateIndex
CREATE INDEX "Reward_merchantId_idx" ON "Reward"("merchantId");

-- CreateIndex
CREATE INDEX "Bill_merchantId_idx" ON "Bill"("merchantId");

-- CreateIndex
CREATE INDEX "Bill_merchantId_customerId_idx" ON "Bill"("merchantId", "customerId");

-- CreateIndex
CREATE INDEX "Bill_merchantId_createdAt_idx" ON "Bill"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "Redemption_merchantId_idx" ON "Redemption"("merchantId");

-- CreateIndex
CREATE INDEX "Redemption_merchantId_customerId_idx" ON "Redemption"("merchantId", "customerId");

-- CreateIndex
CREATE INDEX "Referral_merchantId_idx" ON "Referral"("merchantId");

-- CreateIndex
CREATE INDEX "Referral_merchantId_status_idx" ON "Referral"("merchantId", "status");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_merchantId_idx" ON "WhatsAppMessage"("merchantId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_merchantId_toPhone_idx" ON "WhatsAppMessage"("merchantId", "toPhone");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_metaMessageId_idx" ON "WhatsAppMessage"("metaMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_merchantId_status_idx" ON "WhatsAppMessage"("merchantId", "status");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_status_scheduledFor_idx" ON "WhatsAppMessage"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "AuditLog_merchantId_idx" ON "AuditLog"("merchantId");

-- CreateIndex
CREATE INDEX "AuditLog_merchantId_createdAt_idx" ON "AuditLog"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_merchantId_action_idx" ON "AuditLog"("merchantId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_planKey_key" ON "Plan"("planKey");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_active_idx" ON "Coupon"("active");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_idx" ON "Subscription"("merchantId");

-- CreateIndex
CREATE INDEX "Review_merchantId_idx" ON "Review"("merchantId");

-- CreateIndex
CREATE INDEX "Birthday_merchantId_idx" ON "Birthday"("merchantId");

-- CreateIndex
CREATE INDEX "VipTier_merchantId_idx" ON "VipTier"("merchantId");

-- CreateIndex
CREATE INDEX "SupportTicket_merchantId_idx" ON "SupportTicket"("merchantId");

-- CreateIndex
CREATE INDEX "WaitingCustomer_merchantId_status_idx" ON "WaitingCustomer"("merchantId", "status");

-- CreateIndex
CREATE INDEX "WaitingCustomer_merchantId_customerId_idx" ON "WaitingCustomer"("merchantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantGoogleConnection_merchantId_key" ON "MerchantGoogleConnection"("merchantId");

-- CreateIndex
CREATE INDEX "OTPSession_phone_idx" ON "OTPSession"("phone");

-- CreateIndex
CREATE INDEX "OTPSession_expiresAt_idx" ON "OTPSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessReview_merchantId_gbpReviewId_key" ON "GoogleBusinessReview"("merchantId", "gbpReviewId");

-- CreateIndex
CREATE INDEX "BackgroundJob_merchantId_idx" ON "BackgroundJob"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemContent_key_key" ON "SystemContent"("key");

-- CreateIndex
CREATE INDEX "MessageTemplate_merchantId_idx" ON "MessageTemplate"("merchantId");

-- CreateIndex
CREATE INDEX "MessageTemplate_templateKey_idx" ON "MessageTemplate"("templateKey");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_merchantId_templateKey_language_key" ON "MessageTemplate"("merchantId", "templateKey", "language");

-- CreateIndex
CREATE INDEX "TemplateVersionHistory_templateId_idx" ON "TemplateVersionHistory"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantReferral_referralCode_key" ON "MerchantReferral"("referralCode");

-- CreateIndex
CREATE INDEX "MerchantReferral_referrerMerchantId_idx" ON "MerchantReferral"("referrerMerchantId");

-- CreateIndex
CREATE INDEX "MerchantReferral_referralCode_idx" ON "MerchantReferral"("referralCode");

-- CreateIndex
CREATE INDEX "MerchantReferral_status_idx" ON "MerchantReferral"("status");

-- CreateIndex
CREATE INDEX "GrowthSnapshot_merchantId_idx" ON "GrowthSnapshot"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthSnapshot_merchantId_snapshotDate_key" ON "GrowthSnapshot"("merchantId", "snapshotDate");

-- CreateIndex
CREATE INDEX "GrowthReport_merchantId_idx" ON "GrowthReport"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthReport_merchantId_reportMonth_key" ON "GrowthReport"("merchantId", "reportMonth");

-- CreateIndex
CREATE INDEX "ReviewBonusLog_merchantId_customerId_createdAt_idx" ON "ReviewBonusLog"("merchantId", "customerId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewBonusLog_decision_recheckAt_idx" ON "ReviewBonusLog"("decision", "recheckAt");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalBusinessCard_merchantId_key" ON "DigitalBusinessCard"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalBusinessCard_slug_key" ON "DigitalBusinessCard"("slug");

-- CreateIndex
CREATE INDEX "DigitalBusinessCard_slug_idx" ON "DigitalBusinessCard"("slug");

-- CreateIndex
CREATE INDEX "DigitalBusinessCard_merchantId_idx" ON "DigitalBusinessCard"("merchantId");

-- CreateIndex
CREATE INDEX "GbpChecklistItem_merchantId_idx" ON "GbpChecklistItem"("merchantId");

-- CreateIndex
CREATE INDEX "GbpChecklistItem_track_week_idx" ON "GbpChecklistItem"("track", "week");

-- CreateIndex
CREATE INDEX "GbpChecklistItem_merchantId_isDone_idx" ON "GbpChecklistItem"("merchantId", "isDone");

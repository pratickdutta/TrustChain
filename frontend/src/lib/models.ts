import mongoose, { Schema, Document, models, model } from 'mongoose';

// ── User ──────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  stellarPublicKey: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  lastActiveAt: Date;
  kycLevel: number;
  trustTokens: number;
  isLender: boolean;
  lenderMaxExposure: number;
  lenderManualReview: boolean;
  lenderMinScore: number;
}

const UserSchema = new Schema<IUser>({
  stellarPublicKey: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, default: '' },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  kycLevel: { type: Number, default: 0 },
  trustTokens: { type: Number, default: 0 },
  isLender: { type: Boolean, default: false },
  lenderMaxExposure: { type: Number, default: 500 },
  lenderManualReview: { type: Boolean, default: false },
  lenderMinScore: { type: Number, default: 0 },
});

export const User = models.User || model<IUser>('User', UserSchema);

// ── Score ─────────────────────────────────────────────────────────────────
export interface IScore extends Document {
  userId: string; // stellarPublicKey
  totalScore: number;
  trustScore: number;
  behaviorScore: number;
  activityScore: number;
  tier: string;
  computedAt: Date;
  version: number;
}

const ScoreSchema = new Schema<IScore>({
  userId: { type: String, required: true, unique: true, index: true },
  totalScore: { type: Number, default: 0 },
  trustScore: { type: Number, default: 0 },
  behaviorScore: { type: Number, default: 200 },
  activityScore: { type: Number, default: 0 },
  tier: { type: String, default: 'establishing' },
  computedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
});

export const Score = models.Score || model<IScore>('Score', ScoreSchema);

// ── Circle ────────────────────────────────────────────────────────────────
export interface ICircle extends Document {
  name: string;
  description?: string;
  circleRules?: string;         // Owner-editable rules/charter
  socialLink?: string;          // Optional social media link for owner contact
  uci: string;                  // Unique Circle Identification (immutable after creation)
  creatorId: string;
  isPublic: boolean;
  members: string[];
  pendingJoinRequests: string[]; // pubKeys of users awaiting owner approval
  status: string;
  inviteCode: string;
  borrowApprovalEnabled: boolean; // Platinum-only: owner must approve borrow requests
  isPool: boolean;
  poolOpenToOutside: boolean;
  poolManualApproval: boolean;
  poolMinBorrowerScore: number;
  poolMaxLoanPerBorrower: number;
  poolBalance: number;
  createdAt: Date;
}

function generateUCI(): string {
  const prefix = 'UCI';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O,0,I,1 for clarity
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

const CircleSchema = new Schema<ICircle>({
  name: { type: String, required: true },
  description: String,
  circleRules: { type: String, default: '' },
  socialLink: { type: String, default: '' },
  uci: { type: String, unique: true, default: generateUCI },
  creatorId: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  members: [String],
  pendingJoinRequests: [String],
  status: { type: String, default: 'ACTIVE' },
  inviteCode: { type: String, default: () => Math.random().toString(36).slice(2, 10).toUpperCase() },
  borrowApprovalEnabled: { type: Boolean, default: false },
  isPool: { type: Boolean, default: false },
  poolOpenToOutside: { type: Boolean, default: false },
  poolManualApproval: { type: Boolean, default: true },
  poolMinBorrowerScore: { type: Number, default: 300 },
  poolMaxLoanPerBorrower: { type: Number, default: 500 },
  poolBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Circle = models.Circle || model<ICircle>('Circle', CircleSchema);

export interface ILoan extends Document {
  borrowerId: string;
  amount: number;
  currency: string;
  durationDays: number;
  purpose: string;
  fundingSource: string;
  lenderKey?: string;
  poolId?: string;
  approvedBy?: string;
  status: string;
  disbursedAt?: Date;
  dueDate: Date;
  repaidAmount: number;
  feePercent: number;
  platformFeeCollected?: number; // Added for protocol revenue
  stellarTxHash?: string;
  scoreTierAtRequest: string;
  defaultedAt?: Date;
  createdAt: Date;
}

const LoanSchema = new Schema<ILoan>({
  borrowerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XLM' },
  durationDays: { type: Number, required: true },
  purpose: { type: String, required: true },
  fundingSource: { type: String, default: 'defi' },
  lenderKey: { type: String },
  poolId: { type: String },
  approvedBy: { type: String },
  status: { type: String, default: 'APPROVED' },
  disbursedAt: { type: Date },
  dueDate: { type: Date, required: true },
  repaidAmount: { type: Number, default: 0 },
  feePercent: { type: Number, default: 0 },
  platformFeeCollected: { type: Number, default: 0 },
  stellarTxHash: { type: String },
  scoreTierAtRequest: { type: String, required: true },
  defaultedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const Loan = models.Loan || model<ILoan>('Loan', LoanSchema);

// ── Attestation ───────────────────────────────────────────────────────────
export interface IAttestation extends Document {
  fromUserId: string;
  toUserId: string;
  circleId: string;
  weight: number;
  timeBonus: number;
  credibilityBonus: number;
  createdAt: Date;
}

const AttestationSchema = new Schema<IAttestation>({
  fromUserId: { type: String, required: true, index: true },
  toUserId: { type: String, required: true, index: true },
  circleId: { type: String, required: true },
  weight: { type: Number, default: 0.5 },
  timeBonus: { type: Number, default: 0 },
  credibilityBonus: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate attestations
AttestationSchema.index({ fromUserId: 1, toUserId: 1, circleId: 1 }, { unique: true });

export const Attestation = models.Attestation || model<IAttestation>('Attestation', AttestationSchema);

// ── Pool Deposit ──────────────────────────────────────────────────────────
export interface IPoolDeposit extends Document {
  userId: string;
  circleId: string;
  amount: number;
  createdAt: Date;
}

const PoolDepositSchema = new Schema<IPoolDeposit>({
  userId: { type: String, required: true, index: true },
  circleId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PoolDeposit = models.PoolDeposit || model<IPoolDeposit>('PoolDeposit', PoolDepositSchema);

// ── Pool Payout ─────────────────────────────────────────────────────────
export interface IPoolPayout extends Document {
  userId: string;
  circleId: string;
  circleName: string;
  principal: number;   // original deposit
  interest: number;    // share of pool interest earned
  total: number;       // principal + interest
  createdAt: Date;
}

const PoolPayoutSchema = new Schema<IPoolPayout>({
  userId:     { type: String, required: true, index: true },
  circleId:   { type: String, required: true },
  circleName: { type: String, required: true },
  principal:  { type: Number, required: true },
  interest:   { type: Number, required: true },
  total:      { type: Number, required: true },
  createdAt:  { type: Date, default: Date.now },
});

export const PoolPayout = models.PoolPayout || model<IPoolPayout>('PoolPayout', PoolPayoutSchema);

// ── Nonce ─────────────────────────────────────────────────────────────────
const NonceSchema = new Schema({
  pubKey: { type: String, required: true, unique: true },
  nonce: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // Auto-TTL
});

export const Nonce = models.Nonce || model('Nonce', NonceSchema);

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
  creatorId: string;
  isPublic: boolean;
  members: string[];
  status: string;
  inviteCode: string;
  isPool: boolean;
  poolOpenToOutside: boolean;
  poolManualApproval: boolean;
  poolMinBorrowerScore: number;
  poolMaxLoanPerBorrower: number;
  poolBalance: number;
  createdAt: Date;
}

const CircleSchema = new Schema<ICircle>({
  name: { type: String, required: true },
  description: String,
  creatorId: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  members: [String],
  status: { type: String, default: 'ACTIVE' },
  inviteCode: { type: String, default: () => Math.random().toString(36).slice(2, 10) },
  isPool: { type: Boolean, default: false },
  poolOpenToOutside: { type: Boolean, default: false },
  poolManualApproval: { type: Boolean, default: true },
  poolMinBorrowerScore: { type: Number, default: 300 },
  poolMaxLoanPerBorrower: { type: Number, default: 500 },
  poolBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Circle = models.Circle || model<ICircle>('Circle', CircleSchema);

// ── Loan ──────────────────────────────────────────────────────────────────
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
  stellarTxHash?: string;
  scoreTierAtRequest: string;
  defaultedAt?: Date;
  createdAt: Date;
}

const LoanSchema = new Schema<ILoan>({
  borrowerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XLM' },
  durationDays: Number,
  purpose: { type: String, required: true },
  fundingSource: { type: String, default: 'defi' },
  lenderKey: String,
  poolId: String,
  approvedBy: String,
  status: { type: String, default: 'APPROVED' },
  disbursedAt: Date,
  dueDate: { type: Date, required: true },
  repaidAmount: { type: Number, default: 0 },
  feePercent: Number,
  stellarTxHash: String,
  scoreTierAtRequest: String,
  defaultedAt: Date,
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

// ── Nonce ─────────────────────────────────────────────────────────────────
const NonceSchema = new Schema({
  pubKey: { type: String, required: true, unique: true },
  nonce: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // Auto-TTL
});

export const Nonce = models.Nonce || model('Nonce', NonceSchema);

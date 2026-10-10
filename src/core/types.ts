import type { OutputProfile, TxtLayout } from "./settings";

export type TxtInterpretation = "plain" | "timestamped-speaker" | "plain-fallback";

export type TranscriptFormat = "txt" | "vtt" | "srt";

export type PlanClassification =
  | "eligible"
  | "excluded"
  | "unsupported"
  | "unreadable"
  | "empty"
  | "oversize"
  | "destination-invalid"
  | "destination-exists"
  | "destination-ambiguous";

export type ExecutionStatus =
  | "created"
  | "skipped"
  | "blocked"
  | "stale"
  | "canceled"
  | "needs-attention"
  | "failed";

export interface VaultFileRef {
  readonly path: string;
  readonly extension: string;
  readonly size: number;
  readonly isFile: boolean;
}

export interface SourceEvidence {
  readonly path: string;
  readonly format: TranscriptFormat;
  readonly byteLength: number;
  readonly sha256: string;
}

export interface PlanItem {
  readonly txtInterpretation?: TxtInterpretation;
  readonly txtLayout?: TxtLayout;
  readonly sourcePath: string;
  readonly destinationPath?: string;
  readonly format?: TranscriptFormat;
  readonly classification: PlanClassification;
  readonly reason: string;
  readonly evidence?: SourceEvidence;
  readonly title?: string;
  readonly project?: string;
  readonly outputProfileFingerprint?: string;
}

export interface ConversionPlan {
  readonly txtLayout?: TxtLayout;
  readonly id: string;
  readonly settingsFingerprint: string;
  readonly outputProfile: OutputProfile;
  readonly outputProfileFingerprint: string;
  readonly outputProfileSummary: string;
  readonly createdAt: string;
  readonly items: readonly PlanItem[];
}

export interface TranscriptBlock {
  readonly text: string;
  readonly speaker?: string;
  readonly timing?: {
    readonly start: string;
    readonly end: string;
  };
}

export interface ParsedTranscript {
  readonly txtInterpretation?: TxtInterpretation;
  readonly format: TranscriptFormat;
  readonly blocks: readonly TranscriptBlock[];
}

export interface NoteMetadata {
  readonly sourceFile: string;
  readonly sourceFormat: TranscriptFormat;
  readonly title: string;
  readonly convertedAt: string;
  readonly project?: string;
}

export interface ExecutionOutcome {
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly status: ExecutionStatus;
  readonly reason: string;
}

export interface Result<T, E extends string = string> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: E;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

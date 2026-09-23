export type TranscriptFormat = "txt" | "vtt";

export type PlanClassification =
  | "eligible"
  | "excluded"
  | "unsupported"
  | "unreadable"
  | "empty"
  | "oversize"
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
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly format?: TranscriptFormat;
  readonly classification: PlanClassification;
  readonly reason: string;
  readonly evidence?: SourceEvidence;
  readonly title?: string;
  readonly project?: string;
}

export interface ConversionPlan {
  readonly id: string;
  readonly settingsFingerprint: string;
  readonly createdAt: string;
  readonly items: readonly PlanItem[];
}

export interface TranscriptBlock {
  readonly text: string;
  readonly speaker?: string;
}

export interface ParsedTranscript {
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

// Auto-generated types would live here after running `supabase gen types typescript`
// For now, a hand-written version that matches the schema in supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // uuid, matches Supabase auth.users.id
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
        };
        Update: {
          email?: string | null;
          updated_at?: string;
        };
      };
      linked_wallets: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string; // lowercased for EVM, base58 for Solana
          chain: "evm" | "solana";
          linked_at: string;
        };
        Insert: {
          user_id: string;
          wallet_address: string;
          chain: "evm" | "solana";
        };
        Update: never;
      };
      claims: {
        Row: {
          id: string;
          wallet_address: string;
          chain: "evm" | "solana";
          tx_hash: string;
          token_amount: string; // stored as string to avoid bigint precision loss
          payment_amount: string; // e.g. "0.01" ETH or "0.1" SOL
          claimed_at: string;
          block_number: number | null;
        };
        Insert: {
          wallet_address: string;
          chain: "evm" | "solana";
          tx_hash: string;
          token_amount: string;
          payment_amount: string;
          claimed_at?: string;
          block_number?: number | null;
        };
        Update: {
          block_number?: number | null;
        };
      };
      sale_stats: {
        Row: {
          id: number; // always 1 — single-row stats table
          total_claimed_evm: number;
          total_claimed_solana: number;
          total_raised_eth: string;
          total_raised_sol: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          total_claimed_evm?: number;
          total_claimed_solana?: number;
          total_raised_eth?: string;
          total_raised_sol?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      chain_type: "evm" | "solana";
    };
  };
}

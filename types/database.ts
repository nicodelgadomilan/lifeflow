export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    plan: 'free' | 'pro'
                    role: 'user' | 'admin'
                    currency: string
                    timezone: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    plan?: 'free' | 'pro'
                    role?: 'user' | 'admin'
                    currency?: string
                    timezone?: string
                }
                Update: {
                    full_name?: string | null
                    avatar_url?: string | null
                    plan?: 'free' | 'pro'
                    currency?: string
                    timezone?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    type: 'income' | 'expense'
                    category: string
                    amount: number
                    date: string
                    description: string | null
                    is_fixed: boolean
                    recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    type: 'income' | 'expense'
                    category: string
                    amount: number
                    date: string
                    description?: string | null
                    is_fixed?: boolean
                    recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
                }
                Update: {
                    type?: 'income' | 'expense'
                    category?: string
                    amount?: number
                    date?: string
                    description?: string | null
                    is_fixed?: boolean
                    recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    amount: number
                    currency: string
                    cycle: 'weekly' | 'monthly' | 'yearly'
                    next_date: string
                    category: string | null
                    is_active: boolean
                    logo_url: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    name: string
                    amount: number
                    currency?: string
                    cycle: 'weekly' | 'monthly' | 'yearly'
                    next_date: string
                    category?: string | null
                    is_active?: boolean
                    logo_url?: string | null
                    notes?: string | null
                }
                Update: {
                    name?: string
                    amount?: number
                    currency?: string
                    cycle?: 'weekly' | 'monthly' | 'yearly'
                    next_date?: string
                    category?: string | null
                    is_active?: boolean
                    logo_url?: string | null
                    notes?: string | null
                }
            }
            services: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    amount: number | null
                    due_date: string | null
                    paid_date: string | null
                    is_paid: boolean
                    category: string
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    name: string
                    amount?: number | null
                    due_date?: string | null
                    paid_date?: string | null
                    is_paid?: boolean
                    category?: string
                    notes?: string | null
                }
                Update: {
                    name?: string
                    amount?: number | null
                    due_date?: string | null
                    paid_date?: string | null
                    is_paid?: boolean
                    category?: string
                    notes?: string | null
                }
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    category: 'personal' | 'work' | 'home'
                    priority: 'low' | 'medium' | 'high'
                    status: 'pending' | 'in_progress' | 'done'
                    due_date: string | null
                    completed_at: string | null
                    total_time_sec: number
                    created_at: string
                }
                Insert: {
                    user_id: string
                    title: string
                    description?: string | null
                    category?: 'personal' | 'work' | 'home'
                    priority?: 'low' | 'medium' | 'high'
                    status?: 'pending' | 'in_progress' | 'done'
                    due_date?: string | null
                }
                Update: {
                    title?: string
                    description?: string | null
                    category?: 'personal' | 'work' | 'home'
                    priority?: 'low' | 'medium' | 'high'
                    status?: 'pending' | 'in_progress' | 'done'
                    due_date?: string | null
                    completed_at?: string | null
                    total_time_sec?: number
                }
            }
            savings_goals: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    goal_amount: number
                    current_amount: number
                    location: string | null
                    color: string
                    icon: string
                    target_date: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    name: string
                    goal_amount: number
                    current_amount?: number
                    location?: string | null
                    color?: string
                    icon?: string
                    target_date?: string | null
                    notes?: string | null
                }
                Update: {
                    name?: string
                    goal_amount?: number
                    current_amount?: number
                    location?: string | null
                    color?: string
                    icon?: string
                    target_date?: string | null
                    notes?: string | null
                }
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}

// Tipos de conveniencia
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type Service = Database['public']['Tables']['services']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']

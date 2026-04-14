import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let adminClientInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
    // すでに初期化済みならそれを返す
    if (adminClientInstance) {
        return adminClientInstance
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    }

    if (!key) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    // 初回のみクライアントを作成
    adminClientInstance = createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    return adminClientInstance
}

// Proxyを使って透過的にアクセス
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop, _receiver) {
        const client = getSupabaseAdmin()
        const value = client[prop as keyof SupabaseClient]

        // メソッドの場合はbindする
        if (typeof value === 'function') {
            return value.bind(client)
        }

        return value
    }
})


// import { createClient } from '@supabase/supabase-js'

// if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
//     throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
// }

// if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
// }

// export const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY,
//     {
//         auth: {
//             autoRefreshToken: false,
//             persistSession: false
//         }
//     }
// )

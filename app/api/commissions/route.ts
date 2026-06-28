// Agent Commissions API endpoint
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { }
          },
        },
      }
    )

    const url = new URL(request.url)
    const agentId = url.searchParams.get('agent_id')
    const branchId = url.searchParams.get('branch_id')

    let query = supabase.from('agent_commissions_ledger').select('*')

    if (agentId) {
      query = query.eq('user_id', agentId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Commissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, invoice_id, commission_amount, split_applied } = body

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { }
          },
        },
      }
    )

    const { data: commission, error } = await supabase
      .from('agent_commissions_ledger')
      .insert([
        {
          user_id,
          invoice_id,
          commission_amount,
          split_applied,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log to audit trail
    await supabase.from('audits').insert([
      {
        action_type: 'commission_created',
        user_involved: user_id,
        details: {
          ledger_id: commission.ledger_id,
          amount: commission_amount,
          split_applied,
        },
      },
    ])

    return NextResponse.json(commission, { status: 201 })
  } catch (error) {
    console.error('Commission creation error:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}

// Leads API endpoint - Create, read, and manage leads
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Lead } from '@/lib/types'

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

    let query = supabase.from('leads').select('*')

    if (agentId) {
      query = query.eq('creator_agent_id', agentId)
    }

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creator_agent_id, branch_id, phone_number, email_address, client_name, ai_summary_raw } = body

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

    // Check for duplicate phone/email (global unique constraint)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('lead_id')
      .or(`phone_number.eq.${phone_number},email_address.eq.${email_address}`)
      .single()

    if (existingLead) {
      return NextResponse.json(
        { error: 'Phone number or email already exists' },
        { status: 409 }
      )
    }

    // Create new lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([
        {
          creator_agent_id,
          branch_id,
          phone_number,
          email_address,
          client_name,
          ai_summary_raw,
          is_converted: false,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

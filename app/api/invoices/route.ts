// Invoices API endpoint with commission auto-generation
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COMMISSION_RATE = 0.10 // 10% commission

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

    let query = supabase.from('invoices').select('*')

    if (agentId) {
      query = query.eq('closer_agent_id', agentId)
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
    console.error('Invoices fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id, closer_agent_id, payment_type, amount } = body

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

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Determine if this is a split sale
    const isSplitSale = lead.creator_agent_id !== closer_agent_id

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([
        {
          lead_id,
          branch_id: lead.branch_id,
          closer_agent_id,
          payment_type,
          is_split_sale: isSplitSale,
          status: 'Pending',
          conversion_timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 400 })
    }

    // Auto-create commission ledger entries
    const commissionAmount = amount * COMMISSION_RATE
    
    if (isSplitSale) {
      // Split 50/50 between creator and closer
      const splitAmount = commissionAmount / 2

      await supabase.from('agent_commissions_ledger').insert([
        {
          user_id: lead.creator_agent_id,
          invoice_id: invoice.invoice_id,
          commission_amount: splitAmount,
          split_applied: true,
        },
        {
          user_id: closer_agent_id,
          invoice_id: invoice.invoice_id,
          commission_amount: splitAmount,
          split_applied: true,
        },
      ])
    } else {
      // 100% to closer
      await supabase.from('agent_commissions_ledger').insert([
        {
          user_id: closer_agent_id,
          invoice_id: invoice.invoice_id,
          commission_amount: commissionAmount,
          split_applied: false,
        },
      ])
    }

    // Mark lead as converted
    await supabase
      .from('leads')
      .update({ is_converted: true })
      .eq('lead_id', lead_id)

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

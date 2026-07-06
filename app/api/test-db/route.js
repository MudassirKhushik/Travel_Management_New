import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check if packages table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true });
    
    if (tableError) {
      return NextResponse.json({ 
        error: 'Table error', 
        details: tableError 
      }, { status: 500 });
    }

    // Test 2: Get actual data
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .limit(3);

    return NextResponse.json({
      success: true,
      tableExists: true,
      rowCount: data?.length || 0,
      data: data || []
    });
  } catch (err) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: err.message 
    }, { status: 500 });
  }
}
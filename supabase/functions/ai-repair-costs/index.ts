// Supabase Edge Function: AI Repair Cost Estimator
// Calls Anthropic API to estimate repair costs for faults found during inspection

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { make, model, year, mileage, agreedPrice, faults } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const faultList = faults
      .map((f: { label: string; grade: string; notes: string }) =>
        `- ${f.label} (${f.grade}): ${f.notes || 'No additional notes'}`)
      .join('\n');

    const prompt = `You are a UK used car trade expert. The agreed purchase price before inspection was £${agreedPrice}. Based on the following faults found on a ${year} ${make} ${model} with ${mileage} miles:

${faultList}

Provide estimated repair cost ranges in GBP for each fault, a total repair cost range, and a revised offer price calculated as the original agreed price minus total estimated repair costs.

Return a JSON object with this exact structure:
{
  "estimates": [{"itemKey": "key", "itemLabel": "label", "notes": "brief note", "estimatedCostLow": number, "estimatedCostHigh": number}],
  "totalCostLow": number,
  "totalCostHigh": number,
  "revisedOfferPrice": number
}

Only return the JSON, no other text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '{}';

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

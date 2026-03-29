import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// 전체 가격 오버라이드 조회
export async function GET() {
  try {
    const prices = await redis.hgetall('price_overrides')
    return NextResponse.json(prices || {})
  } catch {
    return NextResponse.json({})
  }
}

// 가격 수정 (관리자만)
export async function POST(request) {
  const { password, id, price } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  await redis.hset('price_overrides', { [id]: price })
  return NextResponse.json({ ok: true })
}

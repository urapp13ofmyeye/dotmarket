import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// 품절 목록 조회 (전체 공개)
export async function GET() {
  try {
    const ids = await redis.smembers('soldout')
    return NextResponse.json(ids.map(Number))
  } catch {
    return NextResponse.json([])
  }
}

// 품절 목록 전체 교체 (관리자만)
export async function POST(request) {
  const { password, ids } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  await redis.del('soldout')
  if (ids.length > 0) {
    await redis.sadd('soldout', ...ids.map(String))
  }
  return NextResponse.json({ ok: true })
}

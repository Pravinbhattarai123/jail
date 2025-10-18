import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            products: {
              take: 6,
              select: { id: true, title: true, slug: true, images: { select: { url: true } } },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: categories })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ categories: [] })
  }
}

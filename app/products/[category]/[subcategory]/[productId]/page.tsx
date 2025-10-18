import JailLuxuryFooter from '@/components/Jailfooter'
import JailLuxurySection from '@/components/JailLuxurySection'
import Naavbar from '@/components/Naavbar'
import ProductMain from '@/components/product/productmain'
import React from 'react'

export default async function ProductSpecification({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  return (
    <div>
        <Naavbar/>
        {/* ProductMain is client-side and will fetch details by id/slug via props */}
        <ProductMain productIdOrSlug={productId} />
        <JailLuxurySection/>
        <JailLuxuryFooter/>
    </div>
  )
}
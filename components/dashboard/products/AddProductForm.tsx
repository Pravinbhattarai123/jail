'use client'
import React, { useEffect, useState } from 'react'

export default function AddProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('0')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [currency, setCurrency] = useState('INR')
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null)
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [gender, setGender] = useState('UNISEX')
  const [material, setMaterial] = useState('')
  const [weight, setWeight] = useState('')
  const [materialsArr, setMaterialsArr] = useState<string>('') // comma separated
  const [images, setImages] = useState<string[]>([])
  const [colorsInput, setColorsInput] = useState('')
  const [colorIds, setColorIds] = useState<number[]>([])
  const [attributesText, setAttributesText] = useState<string>('')
  const [details, setDetails] = useState<any>({}) // { length, breadth, height, weight, unit }
  const [warrantyText, setWarrantyText] = useState('')
  const [moreInfoText, setMoreInfoText] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [measurementImageUrl, setMeasurementImageUrl] = useState('')
  const [sizesInput, setSizesInput] = useState('') // Product.sizes (labels CSV)
  const [clothesSizesInput, setClothesSizesInput] = useState('') // details.clothesSize
  const [shoesSizesInput, setShoesSizesInput] = useState('') // details.shoesSize
  const [brandId, setBrandId] = useState<number | null>(null)
  const [brands, setBrands] = useState<any[]>([])
  const [offerType, setOfferType] = useState('') // PERCENT | FIXED
  const [offerValue, setOfferValue] = useState('')
  const [productVideoUrl, setProductVideoUrl] = useState('')
  const [showInGallery, setShowInGallery] = useState(true)

  useEffect(() => { loadSubcats(); loadBrands() }, [])

  async function loadSubcats() {
    try {
      const res = await fetch('/api/public/categories')
      const json = await res.json()
      // flatten subcategories
      const subs: any[] = []
      json.data.forEach((c: any) => c.subcategories?.forEach((s: any) => subs.push({ ...s, categoryName: c.name })))
      setSubcategories(subs)
    } catch (e) { console.error(e) }
  }

  async function loadBrands() {
    try {
      const res = await fetch('/api/admin/brands')
      const json = await res.json()
      setBrands(json.brands || [])
    } catch (e) { console.error(e) }
  }

  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [colorCatalog, setColorCatalog] = useState<Array<{ id:number; name:string; hex?:string }>>([])
  // No sizeSet logic in new schema; sizes and size tables handled via details arrays

  useEffect(() => { loadColors() }, [])
  async function loadColors() {
    try {
      const [legacyRes, catalogRes] = await Promise.all([
        fetch('/api/admin/products/colors'),
        fetch('/api/admin/colors'),
      ])
      const j = await legacyRes.json().catch(()=>({}))
      const c = await catalogRes.json().catch(()=>({}))
      setAvailableColors(j.data || [])
      setColorCatalog(Array.isArray(c.colors) ? c.colors : [])
    } catch (e) { console.error(e) }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
  const colorsArray = colorsInput.split(',').map(s=>s.trim()).filter(Boolean)
  const sizesArray = sizesInput.split(',').map(s=>s.trim()).filter(Boolean)
  const clothesArray = clothesSizesInput.split(',').map(s=>s.trim()).filter(Boolean)
  const shoesArray = shoesSizesInput.split(',').map(s=>s.trim()).filter(Boolean)
      const payload: any = {
        title,
        price,
        compareAtPrice: compareAtPrice || undefined,
        stock: stock ? Number(stock) : 0,
        currency,
        subcategoryId,
        gender,
        material,
        weight: weight,
        materials: materialsArr.split(',').map(s=>s.trim()).filter(Boolean),
        attributes: (()=>{ try { return attributesText ? JSON.parse(attributesText) : undefined } catch { return undefined } })(),
        images: images, // array of URL strings
        colors: colorsArray.length ? colorsArray : undefined,
        colorIds: colorIds.length ? colorIds : undefined,
        offerType: offerType || undefined,
        offerValue: offerValue || undefined,
        brandId: brandId || undefined,
        videoUrl: productVideoUrl || undefined,
        showInGallery,
      }

      // attach sizes and details
      if (sizesArray.length) payload.sizes = sizesArray
      const dimensions: any = {}
      if ((details as any).length) dimensions.length = Number((details as any).length)
      if ((details as any).breadth) dimensions.breadth = Number((details as any).breadth)
      if ((details as any).height) dimensions.height = Number((details as any).height)
      if ((details as any).weight) dimensions.weight = Number((details as any).weight)
      if ((details as any).unit) dimensions.unit = String((details as any).unit)
      if (Object.keys(dimensions).length || clothesArray.length || shoesArray.length || warrantyText || moreInfoText || heroImageUrl || measurementImageUrl) {
        // Map breadth -> width for backend
        if ((dimensions as any).breadth && !(dimensions as any).width) {
          ;(dimensions as any).width = Number((dimensions as any).breadth)
          delete (dimensions as any).breadth
        }
        payload.details = {
          dimensions: Object.keys(dimensions).length ? dimensions : undefined,
          clothesSize: clothesArray.length ? clothesArray : undefined,
          shoesSize: shoesArray.length ? shoesArray : undefined,
          warranty: warrantyText || undefined,
          moreInfo: moreInfoText || undefined,
          heroImageUrl: heroImageUrl || undefined,
          measurementImageUrl: measurementImageUrl || undefined,
        }
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json?.data) {
        setTitle('')
        setPrice('0')
        setCompareAtPrice('')
        setStock('0')
        setCurrency('INR')
        setImages([])
        setColorsInput('')
        setSizesInput('')
        setClothesSizesInput('')
        setShoesSizesInput('')
        setMaterial('')
        setBrandId(null)
        setOfferType('')
        setOfferValue('')
        setDetails({})
  setProductVideoUrl('')
        if (onSuccess) onSuccess()
        alert('Product created')
      } else {
        alert('Create failed')
      }
    } catch (err) {
      console.error(err)
      alert('Error')
    }
  }

  // Derived type flags from selected subcategory name/category
  const selectedSub = subcategories.find((s) => s.id === subcategoryId)
  const nameForType = `${selectedSub?.name || ''} ${selectedSub?.categoryName || ''}`.toLowerCase()
  const bagSynonyms = ['bag','bags','luggage','backpack','rucksack','duffel','duffle','suitcase','trolley','carry-on','carryon','briefcase','messenger']
  const isBag = bagSynonyms.some((w) => nameForType.includes(w))
  const isJacket = nameForType.includes('jacket') || nameForType.includes('coat')
  const isShoe = nameForType.includes('shoe') || nameForType.includes('shoes')

  return (
    <form onSubmit={onSubmit} className="p-4 border rounded-md space-y-3">
      <h3 className="font-medium">Add product</h3>
      <div>
        <label className="block">Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Price</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label>Compare at</label>
          <input value={compareAtPrice} onChange={e=>setCompareAtPrice(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      </div>
      <div>
        <label>Currency</label>
        <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <div>
        <label>Stock</label>
        <input value={stock} onChange={e=>setStock(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>

      <div>
        <label>Category / Subcategory</label>
        <select className="w-full border rounded px-2 py-1" value={subcategoryId ?? ''} onChange={e=>setSubcategoryId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Select subcategory</option>
          {subcategories.map(s => (
            <option key={s.id} value={s.id}>{s.categoryName} / {s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Brand</label>
        <select className="w-full border rounded px-2 py-1" value={brandId ?? ''} onChange={e=>setBrandId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Select brand (optional)</option>
          {brands.map((b:any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Gender</label>
        <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="UNISEX">Unisex</option>
        </select>
      </div>

      <div>
        <label>Material</label>
        <input placeholder="Leather, Cotton, Synthetic" value={material} onChange={e=>setMaterial(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Weight</label>
          <input placeholder="e.g. 1.2kg or 1200g" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label>Materials (comma separated)</label>
          <input placeholder="leather, nylon" value={materialsArr} onChange={e=>setMaterialsArr(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Offer Type</label>
          <select value={offerType} onChange={e=>setOfferType(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="">None</option>
            <option value="PERCENT">Percent</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>
        <div>
          <label>Offer Value</label>
          <input placeholder="e.g. 10 or 500" value={offerValue} onChange={e=>setOfferValue(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div>
        <label>Colors (comma separated)</label>
        <input placeholder="red,blue,black" value={colorsInput} onChange={e=>setColorsInput(e.target.value)} className="w-full border rounded px-2 py-1" />
        {availableColors.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {availableColors.map(c => (
              <label key={c} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={colorsInput.split(',').map(s=>s.trim()).includes(c)} onChange={(e)=>{
                  const arr = colorsInput.split(',').map(s=>s.trim()).filter(Boolean)
                  if (e.target.checked) arr.push(c)
                  else {
                    const idx = arr.indexOf(c); if (idx!==-1) arr.splice(idx,1)
                  }
                  setColorsInput(arr.join(','))
                }} />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div>
        <label>Color Catalog</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {colorCatalog.map(c => (
            <label key={c.id} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={colorIds.includes(c.id)}
                onChange={(e)=>{
                  setColorIds(prev => e.target.checked ? [...prev, c.id] : prev.filter(id=>id!==c.id))
                }}
              />
              <span className="capitalize" style={{ backgroundColor: c.hex || 'transparent' }}>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {!isJacket && !isShoe && (
        <div>
          <label>Product Size Labels (comma separated)</label>
          <input placeholder="S,M,L,XL (for Jackets) or 7,8,9 (for Shoes)" value={sizesInput} onChange={e=>setSizesInput(e.target.value)} className="w-full border rounded px-2 py-1" />
          <small className="text-muted">For Jackets: use S, M, L, XL, XXL. For Shoes: use numeric sizes. Optional field used for filtering.</small>
        </div>
      )}

      {isJacket && !isBag && (
        <div>
          <label>Clothes Sizes (comma separated)</label>
          <input placeholder="S,XS,M,L,XL,XXL (for Jackets/Clothing)" value={clothesSizesInput} onChange={e=>setClothesSizesInput(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      )}
      {isShoe && !isBag && (
        <div>
          <label>Shoes Sizes (comma separated)</label>
          <input placeholder="7,8,9 (for Shoes)" value={shoesSizesInput} onChange={e=>setShoesSizesInput(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      )}

      <div>
        <label>Dimensions (for products like bags)</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input placeholder="Length" value={details.length||''} onChange={e=>setDetails({...details, length: e.target.value})} className="border rounded px-2 py-1" />
          <input placeholder="Breadth/Width" value={details.breadth||details.width||''} onChange={e=>setDetails({...details, breadth: e.target.value})} className="border rounded px-2 py-1" />
          <input placeholder="Height" value={details.height||''} onChange={e=>setDetails({...details, height: e.target.value})} className="border rounded px-2 py-1" />
          <input placeholder="Weight" value={details.weight||''} onChange={e=>setDetails({...details, weight: e.target.value})} className="border rounded px-2 py-1" />
          <input placeholder="Unit (cm/inch)" value={details.unit||''} onChange={e=>setDetails({...details, unit: e.target.value})} className="border rounded px-2 py-1 col-span-2 md:col-span-1" />
          {/* Bags & Luggage Only */}
          {isBag && (
            <input placeholder="Volume (Liters)" value={(details as any).capacityLiters||''} onChange={e=>setDetails({...details, capacityLiters: e.target.value})} className="border rounded px-2 py-1 col-span-2 md:col-span-1" />
          )}
        </div>
      </div>

      <div>
        <label>Warranty & Return</label>
        <textarea placeholder="Warranty, return policy details" value={warrantyText} onChange={e=>setWarrantyText(e.target.value)} className="w-full border rounded px-2 py-1 h-20" />
      </div>
      <div>
        <label>More Information</label>
        <textarea placeholder="Any additional product information" value={moreInfoText} onChange={e=>setMoreInfoText(e.target.value)} className="w-full border rounded px-2 py-1 h-20" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Hero Image URL</label>
          <input placeholder="https://..." value={heroImageUrl} onChange={e=>setHeroImageUrl(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label>Measurement/Size Chart Image URL</label>
          <input placeholder="https://..." value={measurementImageUrl} onChange={e=>setMeasurementImageUrl(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div>
        <label>Attributes (JSON)</label>
        <textarea placeholder='{"capacity": 30, "laptopSize":"15 inch"}' value={attributesText} onChange={e=>setAttributesText(e.target.value)} className="w-full border rounded px-2 py-1 h-24" />
        <small className="text-muted">Optional: Additional category-specific fields.</small>
      </div>

      <div>
        <span className="block mb-1">Show this product in Image Gallery</span>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="showInGallery"
              value="yes"
              checked={showInGallery === true}
              onChange={()=>setShowInGallery(true)}
            />
            <span>Yes</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="showInGallery"
              value="no"
              checked={showInGallery === false}
              onChange={()=>setShowInGallery(false)}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <div>
        <label>Images (comma separated URLs)</label>
        <input placeholder="https://... , https://..." value={images.join(',')} onChange={e=>setImages(e.target.value.split(',').map(s=>s.trim()))} className="w-full border rounded px-2 py-1" />
      </div>

      <div>
        <button className="btn btn-primary" type="submit">Create</button>
      </div>
    </form>
  )
}

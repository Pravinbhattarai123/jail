'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function ProductsPage() {
  type Product = {
    id: number
    title: string
    price: number
    currency: string
    stock: number
    videoUrl?: string | null
    brand?: { id: number; name: string }
    subcategory?: { id: number; name: string; category?: { id: number; name: string } }
    // Add other fields as needed
  }
  const [items, setItems] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('') // id or slug
  const [subcategory, setSubcategory] = useState('') // id or slug
  type Brand = { id: number; name: string }
  const [brands, setBrands] = useState<Brand[]>([])
  type Category = { id: number; name: string }
  type Subcategory = { id: number; name: string; category?: Category }
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [colorCatalog, setColorCatalog] = useState<Array<{ id: number; name: string; hex?: string }>>([])
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'INR',
    stock: 0,
    color: '',
    brandId: '', // stringified id
    categoryId: '', // for dependent subcategory fetch only
    subcategoryId: '', // stringified id for submit
    images: [] as File[],
    // shared product fields
    weight: '',
    materialsText: '', // CSV input -> materials[]
    attributesText: '', // JSON input -> attributes
    // details
    warranty: '',
    moreInfo: '',
    heroImageUrl: '',
    dimLength: '',
    dimWidth: '',
    dimHeight: '',
    dimWeight: '',
    dimUnit: 'cm',
    heroImageFile: null as File | null,
  })
  const [features, setFeatures] = useState<Array<{ title: string; description: string; imageUrl?: string; imageFile?: File | null; order?: number }>>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE' | 'UNISEX'>('UNISEX')
  const [productColors, setProductColors] = useState<string[]>([])
  const [sizesText, setSizesText] = useState('') // comma separated sizes
  const baseSizes = ['S','M','L','XL']
  const [sizeOptions, setSizeOptions] = useState<string[]>(baseSizes)
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({ S: 0, M: 0, L: 0, XL: 0 })
  const [sizeChart, setSizeChart] = useState<Record<string, { chest?: number | string; length?: number | string }>>({ S: {}, M: {}, L: {}, XL: {} })
  const [sizeGuidance, setSizeGuidance] = useState('')
  const [clothesSizesText, setClothesSizesText] = useState('') // details.clothesSize
  const [shoesSizesText, setShoesSizesText] = useState('') // details.shoesSize
  const [selectedSizeSetId, setSelectedSizeSetId] = useState<number | null>(null)
  const [subcategoryHasSizeSet, setSubcategoryHasSizeSet] = useState(false)
  const [measurementImageUrl, setMeasurementImageUrl] = useState('')
  const [productVideoUrl, setProductVideoUrl] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [showInGallery, setShowInGallery] = useState<boolean>(true)
  // dynamic attributes builder
  const [attributesRows, setAttributesRows] = useState<Array<{ key: string; value: string }>>([])
  const [capacityLiters, setCapacityLiters] = useState<string>('')
  const [forceSizes, setForceSizes] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editUploading, setEditUploading] = useState(false)
  // Keep a stable copy of the selected subcategory label to avoid flicker when lists refresh
  const [selectedSubNameLabel, setSelectedSubNameLabel] = useState<string>('')
  // derived UI flags (based on selected subcategory name)
  const selectedSub = subcategories.find((x) => String(x.id) === String(form.subcategoryId))
  const selectedCat = categories.find((x) => String(x.id) === String(form.categoryId))
  const subName = (selectedSub?.name || selectedSubNameLabel || '').toLowerCase()
  const catName = (selectedCat?.name || '').toLowerCase()
  // Use both subcategory and category names together for robust detection
  const nameForType = `${subName} ${catName}`.trim()
  const isJacket = nameForType.includes('jacket') || nameForType.includes('coat')
  const isWallet = nameForType.includes('wallet')
  const bagSynonyms = ['bag','bags','luggage','backpack','rucksack','duffel','duffle','suitcase','trolley','carry-on','carryon','briefcase','messenger']
  const isLaptopBag = nameForType.includes('laptop')
  const isBag = bagSynonyms.some((w) => nameForType.includes(w)) && !isLaptopBag
  const isBelt = nameForType.includes('belt')
  const isShoe = nameForType.includes('shoe') || nameForType.includes('shoes')

  const load = async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (subcategory) params.set('subcategory', subcategory)
    try {
      const res = await fetch('/api/admin/products' + (params.toString() ? `?${params}` : ''), { cache: 'no-store' })
      if (!res.ok) {
        // Try to extract error payload if present
        let msg = 'Failed to load products'
        try {
          const maybeJson = await res.json()
          msg = maybeJson?.error || msg
        } catch {
          const txt = await res.text().catch(() => '')
          if (txt) msg = txt
        }
        setError(msg)
        setItems([])
        return
      }
      // Parse JSON safely
      let data: { items?: Product[] } = {}
      try {
        data = await res.json()
      } catch {
        // fallback to text to aid debugging
        const txt = await res.text().catch(() => '')
        setError(txt || 'Unexpected response while loading products')
        setItems([])
        return
      }
      setItems(Array.isArray(data.items) ? data.items : [])
      setError('')
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Network error while loading products')
      }
      setItems([])
    }
  }
  const onDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Failed to delete')
      return
    }
    await load()
  }

  const openEditProduct = (product: any) => {
    setEditingProduct(product)
    setEditVideoUrl(product?.videoUrl || '')
    setEditError('')
  }

  const closeEditProduct = () => {
    if (editUploading || editSaving) return
    setEditingProduct(null)
    setEditVideoUrl('')
    setEditError('')
  }

  const uploadEditVideo = async (file: File | null) => {
    if (!file) return
    setEditError('')
    setEditUploading(true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch('/api/admin/uploads/videos', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !Array.isArray(json.urls) || !json.urls[0]) {
        throw new Error(json.error || 'Video upload failed')
      }
      setEditVideoUrl(json.urls[0])
    } catch (err: any) {
      setEditError(err?.message || 'Video upload failed')
    } finally {
      setEditUploading(false)
    }
  }

  const saveEditProduct = async () => {
    if (!editingProduct) return
    setEditSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: editVideoUrl?.trim() ? editVideoUrl.trim() : null }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update product')
      }
      await load()
      closeEditProduct()
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update product')
    } finally {
      setEditSaving(false)
    }
  }

  useEffect(() => { load() }, [])

  // fetch public categories (with sizeSet info), suggested colors, and color catalog for UI decisions
  useEffect(() => {
    const run = async () => {
      try {
        const [publicCatsRes, colorsRes, colorCatalogRes] = await Promise.all([
          fetch('/api/public/categories', { cache: 'no-store' }),
          fetch('/api/admin/products/colors', { cache: 'no-store' }),
          fetch('/api/admin/colors', { cache: 'no-store' }),
        ])
        const catsJson = await publicCatsRes.json().catch(() => ({}))
        const colorsJson = await colorsRes.json().catch(() => ({}))
        const colorCatalogJson = await colorCatalogRes.json().catch(() => ({}))
        // flatten subcategories for dropdowns if needed
        if (Array.isArray(catsJson.categories)) {
          const subs: Subcategory[] = []
          ;(catsJson.categories || []).forEach((c: any) => {
            ;(c.subcategories || []).forEach((s: any) => subs.push({ id: s.id, name: s.name, category: { id: c.id, name: c.name } }))
          })
          setSubcategories(subs)
        }
        if (colorsRes.ok && Array.isArray(colorsJson.colors)) setAvailableColors(colorsJson.colors)
        if (colorCatalogRes.ok && Array.isArray(colorCatalogJson.colors)) setColorCatalog(colorCatalogJson.colors)
      } catch (e) {
        // ignore
      }
    }
    run()
  }, [])

  // Prefetch categories and brands for dropdowns
  useEffect(() => {
    const run = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          fetch('/api/admin/categories', { cache: 'no-store' }),
          fetch('/api/admin/brands', { cache: 'no-store' }),
        ])
        const catsJson = await catsRes.json().catch(() => ({}))
        const brandsJson = await brandsRes.json().catch(() => ({}))
        if (catsRes.ok) setCategories(catsJson.categories || [])
        if (brandsRes.ok) setBrands(brandsJson.brands || [])
      } catch (e) {
        // ignore background prefetch errors
      }
    }
    run()
  }, [])

  // Fetch subcategories when a category is picked in form
  useEffect(() => {
    const run = async () => {
      if (!form.categoryId) { setSubcategories([]); return }
      try {
        const res = await fetch(`/api/admin/subcategories?category=${encodeURIComponent(form.categoryId)}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (res.ok) setSubcategories(json.subcategories || [])
      } catch {}
    }
    run()
  }, [form.categoryId])

  // When subcategoryId changes, detect if it has a SizeSet and set accordingly
  useEffect(() => {
    const run = async () => {
      setSubcategoryHasSizeSet(false)
      setSelectedSizeSetId(null)
      setMeasurementImageUrl('')
      if (!form.subcategoryId) return
      try {
        // public categories endpoint returns nested subcategory.sizeSet
        const res = await fetch('/api/public/categories', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) return
        const all = json.categories || []
        for (const c of all) {
          for (const s of (c.subcategories || [])) {
            if (String(s.id) === String(form.subcategoryId)) {
              if (s.sizeSet) {
                setSubcategoryHasSizeSet(true)
                setSelectedSizeSetId(s.sizeSet.id || null)
                setMeasurementImageUrl(s.sizeSet.measurementImageUrl || '')
              }
              return
            }
          }
        }
      } catch (e) {}
    }
    run()
  }, [form.subcategoryId])

  const updateForm = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  // Generate image previews when files change
  useEffect(() => {
    const urls = (form.images || []).map((file) => URL.createObjectURL(file))
    setImagePreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [form.images])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (!form.title.trim()) throw new Error('Title is required')
      if (!form.price) throw new Error('Price is required')
      if (!form.subcategoryId) throw new Error('Subcategory is required')
      if (!form.weight || !String(form.weight).trim()) throw new Error('Weight is required')
      const materialsArr = (form.materialsText || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (!materialsArr.length) throw new Error('Materials are required (comma-separated)')

      const payload: any = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        price: form.price,
        currency: form.currency || 'INR',
        stock: Number(form.stock) || 0,
        gender: selectedGender,
        colors: productColors.length ? productColors : undefined,
        sizes: sizesText ? sizesText.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        weight: String(form.weight).trim(),
        materials: materialsArr,
        videoUrl: productVideoUrl?.trim() || undefined,
        showInGallery,
      }
      // optional attributes JSON + builder rows + capacity
      const attributesMerged: Record<string, any> = {}
      const attrTxt = (form.attributesText || '').trim()
      if (attrTxt) {
        try {
          const parsed = JSON.parse(attrTxt)
          if (parsed && typeof parsed === 'object') Object.assign(attributesMerged, parsed)
          else throw new Error('Attributes must be a JSON object')
        } catch (err: any) {
          throw new Error('Invalid Attributes JSON')
        }
      }
      if (attributesRows.length) {
        attributesRows.forEach(({ key, value }) => {
          const k = (key || '').trim()
          if (!k) return
          // try to coerce number/boolean
          let v: any = value
          if (/^\d+(\.\d+)?$/.test(value)) v = Number(value)
          if (/(true|false)$/i.test(value)) v = /^true$/i.test(value)
          attributesMerged[k] = v
        })
      }
      if (capacityLiters && String(capacityLiters).trim()) {
        const n = Number(capacityLiters)
        attributesMerged.capacityLiters = Number.isFinite(n) ? n : String(capacityLiters).trim()
      }
      if (Object.keys(attributesMerged).length) payload.attributes = attributesMerged
      const subId = Number(form.subcategoryId)
      if (!Number.isNaN(subId)) payload.subcategoryId = subId
      const brandIdNum = Number(form.brandId)
      if (!Number.isNaN(brandIdNum) && brandIdNum > 0) payload.brandId = brandIdNum
      if (selectedColorIds.length) payload.colorIds = selectedColorIds

      // If there are images, upload them first and include URLs
      if (form.images && form.images.length) {
        const fd = new FormData()
        for (const f of form.images) fd.append('files', f)
        const upRes = await fetch('/api/admin/uploads/images', { method: 'POST', body: fd })
        const upJson = await upRes.json().catch(() => ({}))
        if (!upRes.ok) throw new Error(upJson.error || 'Failed to upload images')
        if (Array.isArray(upJson.urls) && upJson.urls.length) payload.images = upJson.urls
      }

      // Upload hero image file (single) if provided
      if ((form as any).heroImageFile) {
        const fd = new FormData()
        fd.append('files', (form as any).heroImageFile)
        const resUp = await fetch('/api/admin/uploads/images', { method: 'POST', body: fd })
        const jsonUp = await resUp.json().catch(() => ({}))
        if (!resUp.ok) throw new Error(jsonUp.error || 'Failed to upload hero image')
        if (Array.isArray(jsonUp.urls) && jsonUp.urls[0]) {
          payload.details = payload.details || {}
          payload.details.heroImageUrl = jsonUp.urls[0]
        }
      }

      // Upload feature images if present
      if (features && features.length) {
        // collect files
        const featureFiles: File[] = []
        const fileIdxToFeatureIdx: Record<number, number> = {}
        features.forEach((f, idx) => {
          if (f.imageFile) {
            const id = featureFiles.length
            featureFiles.push(f.imageFile)
            fileIdxToFeatureIdx[id] = idx
          }
        })
        if (featureFiles.length) {
          const fd = new FormData()
          for (const f of featureFiles) fd.append('files', f)
          const upRes = await fetch('/api/admin/uploads/images', { method: 'POST', body: fd })
          const upJson = await upRes.json().catch(() => ({}))
          if (!upRes.ok) throw new Error(upJson.error || 'Failed to upload feature images')
          if (Array.isArray(upJson.urls)) {
            // map back
            Object.keys(fileIdxToFeatureIdx).forEach((k) => {
              const fileIndex = Number(k)
              const featIndex = fileIdxToFeatureIdx[fileIndex]
              const url = upJson.urls[fileIndex]
              if (url) {
                features[featIndex].imageUrl = url
              }
            })
          }
        }
      }

      // Optional details
      const clothesArr = clothesSizesText.split(',').map((s) => s.trim()).filter(Boolean)
      const shoesArr = shoesSizesText.split(',').map((s) => s.trim()).filter(Boolean)
      const hasDetails = Boolean(
        form.warranty?.trim() || form.moreInfo?.trim() || (form as any).heroImageFile || form.heroImageUrl?.trim() ||
        form.dimLength || form.dimWidth || form.dimHeight || form.dimWeight ||
        clothesArr.length || shoesArr.length
      )
      if (hasDetails) {
        const dimensions: any = {}
        // common dimensions
        if (form.dimLength) dimensions.length = Number(form.dimLength)
        if (form.dimWidth) dimensions.width = Number(form.dimWidth)
        if (form.dimHeight) dimensions.height = Number(form.dimHeight)
        if (form.dimWeight) dimensions.weight = Number(form.dimWeight)
        if (form.dimUnit) dimensions.unit = form.dimUnit
        // belt length
        if (isBelt && (form as any).beltLength) dimensions.beltLength = Number((form as any).beltLength)
        // bag capacity (use component state)
        if (isBag && capacityLiters && String(capacityLiters).trim()) {
          const n = Number(capacityLiters)
          dimensions.capacityLiters = Number.isFinite(n) ? n : undefined
        }
        // laptop bag screen size (inches)
        if (isLaptopBag && (form as any).screenInch) dimensions.screenInch = (form as any).screenInch
        // wallet thickness (if provided)
        if (isWallet && (form as any).thickness) dimensions.thickness = Number((form as any).thickness)
        payload.details = {
          warranty: form.warranty?.trim() || undefined,
          moreInfo: form.moreInfo?.trim() || undefined,
          heroImageUrl: payload.details?.heroImageUrl || form.heroImageUrl?.trim() || undefined,
          dimensions: Object.keys(dimensions).length ? dimensions : undefined,
          clothesSize: clothesArr.length ? clothesArr : undefined,
          shoesSize: shoesArr.length ? shoesArr : undefined,
        }
      }

  // If sizeSet is selected, include it and measurement image
  if (selectedSizeSetId) payload.sizeSetId = selectedSizeSetId
  if (measurementImageUrl) payload.measurementImageUrl = measurementImageUrl

      if (features.length) {
        payload.features = features
          .filter((f) => f.title && f.title.trim())
          .map((f, idx) => ({
            title: f.title.trim(),
            description: f.description?.trim() || undefined,
            imageUrl: f.imageUrl?.trim() || undefined,
            order: typeof f.order === 'number' ? f.order : idx,
          }))
      }

      // Sizes and per-size stock/size chart
      // Collect enabled sizes from sizeOptions (base + custom via chips), override sizesText if present
      if (sizeOptions && sizeOptions.length) {
        payload.sizes = Array.from(new Set(sizeOptions.map((s) => s.trim()).filter(Boolean)))
      }
      // size stock and chart merged into attributes
      if (!payload.attributes) payload.attributes = {}
      payload.attributes.sizeStock = {}
      Object.entries(sizeStocks).forEach(([sz, qty]) => {
        if (sz && typeof qty === 'number' && qty >= 0) (payload.attributes.sizeStock as any)[sz] = qty
      })
      // include size chart and guidance
      payload.attributes.sizeChart = {}
      Object.entries(sizeChart).forEach(([sz, val]) => {
        const chest = val?.chest
        const length = val?.length
        if (chest != null || length != null) (payload.attributes.sizeChart as any)[sz] = {
          ...(chest != null ? { chest } : {}),
          ...(length != null ? { length } : {}),
        }
      })
      if (sizeGuidance.trim()) payload.attributes.sizeGuidance = sizeGuidance.trim()

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to create product')

      // Reset minimal fields and refresh list
      setForm({
        ...form,
        title: '',
        description: '',
        price: '',
        stock: 0,
        subcategoryId: '',
        images: [],
        weight: '',
        materialsText: '',
        attributesText: '',
        warranty: '',
        moreInfo: '',
        heroImageUrl: '',
        dimLength: '',
        dimWidth: '',
        dimHeight: '',
        dimWeight: '',
      })
      setProductVideoUrl('')
      setClothesSizesText('')
      setShoesSizesText('')
      setFeatures([])
  setAttributesRows([])
  setCapacityLiters('')
  setSizeOptions(baseSizes)
  setCustomSizeInput('')
  setSizeStocks({ S: 0, M: 0, L: 0, XL: 0 })
  setSizeChart({ S: {}, M: {}, L: {}, XL: {} })
  setSizeGuidance('')
      setSelectedColorIds([])
      setProductColors([])
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}

      <Card title="Add Product">
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                placeholder="Product title"
              />

              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="Long description"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.weight}
                    onChange={(e) => updateForm({ weight: e.target.value })}
                    placeholder="e.g. 450 g or 0.45 kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Materials (comma-separated)</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.materialsText}
                    onChange={(e) => updateForm({ materialsText: e.target.value })}
                    placeholder="e.g. Leather, Cotton"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Show in homepage image gallery</label>
                <div className="flex items-center gap-6 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="showInGallery"
                      value="yes"
                      checked={showInGallery === true}
                      onChange={() => setShowInGallery(true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="showInGallery"
                      value="no"
                      checked={showInGallery === false}
                      onChange={() => setShowInGallery(false)}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Capacity (liters) */}
              {(isBag || isLaptopBag) && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity (liters)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={capacityLiters}
                      onChange={(e) => setCapacityLiters(e.target.value)}
                      placeholder="e.g. 15"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              )}

              {/* Sizes selection - only for Jackets and Bags (or forced) */}
              {(isJacket || isBag || forceSizes) && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700">Sizes</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sizeOptions.map((sz) => (
                      <span key={sz} className="px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-2">
                        {sz}
                        {!['S','M','L','XL'].includes(sz) && (
                          <button type="button" className="text-red-600" onClick={() => setSizeOptions((opts) => opts.filter((s) => s !== sz))}>×</button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = customSizeInput.trim().toUpperCase()
                          if (val && !sizeOptions.includes(val)) setSizeOptions((opts) => [...opts, val])
                          setCustomSizeInput('')
                        }
                      }}
                      placeholder="Add custom size (Enter)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button type="button" className="text-sm px-3 py-2 bg-gray-100 rounded" onClick={() => {
                      const val = customSizeInput.trim().toUpperCase()
                      if (val && !sizeOptions.includes(val)) setSizeOptions((opts) => [...opts, val])
                      setCustomSizeInput('')
                    }}>Add</button>
                  </div>
                </div>
              )}

              {/* Per-size stock - only for Jackets and Bags (or forced) */}
              {(isJacket || isBag || forceSizes) && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700">Per-size stock</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {sizeOptions.map((sz) => (
                      <div key={sz}>
                        <label className="text-xs text-gray-600">{sz}</label>
                        <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={sizeStocks[sz] ?? 0} onChange={(e) => setSizeStocks((st) => ({ ...st, [sz]: Math.max(0, parseInt(e.target.value || '0', 10)) }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes builder */}
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Attributes</label>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setAttributesRows((rows) => [...rows, { key: '', value: '' }])}
                  >
                    + Add attribute
                  </button>
                </div>
                {attributesRows.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attributesRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2">
                        <input
                          className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Key (e.g. pockets)"
                          value={row.key}
                          onChange={(e) => setAttributesRows((rs) => rs.map((r, i) => i === idx ? { ...r, key: e.target.value } : r))}
                        />
                        <input
                          className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Value (e.g. 2 or leather)"
                          value={row.value}
                          onChange={(e) => setAttributesRows((rs) => rs.map((r, i) => i === idx ? { ...r, value: e.target.value } : r))}
                        />
                        <div className="col-span-5 text-right">
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={() => setAttributesRows((rs) => rs.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.price}
                    onChange={(e) => updateForm({ price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    title="Select currency"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.currency}
                    onChange={(e) => updateForm({ currency: e.target.value })}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.stock}
                    onChange={(e) => updateForm({ stock: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input id="forceSizes" type="checkbox" checked={forceSizes} onChange={(e) => setForceSizes(e.target.checked)} />
                  <label htmlFor="forceSizes" className="text-xs text-gray-600">Force show size UI</label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                title="Select category"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.categoryId}
                onChange={(e) => updateForm({ categoryId: e.target.value, subcategoryId: '' })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <select
                title="Select subcategory"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.subcategoryId}
                onChange={(e) => {
                  const label = (e.target as HTMLSelectElement).selectedOptions?.[0]?.text || ''
                  setSelectedSubNameLabel(label)
                  updateForm({ subcategoryId: e.target.value })
                }}
              >
                <option value="">Select subcategory</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <select
                title="Select brand"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.brandId}
                onChange={(e) => updateForm({ brandId: e.target.value })}
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                title="Select gender"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as any)}
              >
                <option value="UNISEX">Unisex</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => updateForm({ images: Array.from(e.target.files || []) as File[] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-md border" />
                  ))}
                </div>
              )}

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">Colors</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add color (e.g. red) and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = (e.currentTarget as HTMLInputElement).value.trim()
                        if (val && !productColors.includes(val)) setProductColors((c) => [...c, val])
                        ;(e.currentTarget as HTMLInputElement).value = ''
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    title="Enter a color and press Enter"
                  />
                  <button type="button" onClick={() => setProductColors([])} className="text-sm px-2 py-1 bg-gray-100 rounded">Clear</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productColors.map((c, i) => (
                    <span key={c + i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs flex items-center gap-2">
                      {c}
                      <button type="button" onClick={() => setProductColors((arr) => arr.filter((x) => x !== c))} className="ml-2 text-red-500">×</button>
                    </span>
                  ))}
                </div>

                {availableColors.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="font-medium">Suggested colors</div>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {availableColors.map((c) => (
                        <label key={c} className="inline-flex items-center gap-2 text-sm bg-gray-50 px-2 py-1 rounded">
                          <input type="checkbox" checked={productColors.includes(c)} onChange={(e) => {
                            if (e.currentTarget.checked) setProductColors((arr) => Array.from(new Set([...arr, c])))
                            else setProductColors((arr) => arr.filter((x) => x !== c))
                          }} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {colorCatalog.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="font-medium">Color catalog</div>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {colorCatalog.map((c) => (
                        <label key={c.id} className="inline-flex items-center gap-2 text-sm bg-gray-50 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedColorIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.currentTarget.checked) setSelectedColorIds((arr) => Array.from(new Set([...arr, c.id])))
                              else setSelectedColorIds((arr) => arr.filter((x) => x !== c.id))
                            }}
                          />
                          <span className="flex items-center gap-1">
                            {c.hex ? <span className="inline-block w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex }} /> : null}
                            {c.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {showAdvanced ? 'Hide advanced' : 'Show advanced'}
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warranty</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.warranty}
                      onChange={(e) => updateForm({ warranty: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hero image URL</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.heroImageUrl}
                      onChange={(e) => updateForm({ heroImageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions unit</label>
                    <select
                      title="Select dimensions unit"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.dimUnit}
                      onChange={(e) => updateForm({ dimUnit: e.target.value })}
                    >
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </div>

                {/* Attributes (JSON) removed as per requirements. Attributes now built via UI (builder + capacity/size). */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">More info</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.moreInfo}
                    onChange={(e) => updateForm({ moreInfo: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Length</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.dimLength}
                      onChange={(e) => updateForm({ dimLength: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Width</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.dimWidth}
                      onChange={(e) => updateForm({ dimWidth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Height</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.dimHeight}
                      onChange={(e) => updateForm({ dimHeight: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.dimWeight}
                      onChange={(e) => updateForm({ dimWeight: e.target.value })}
                    />
                  </div>
                </div>

                {/* Sizes vs Dimensions & measurement image */}
                <div className="space-y-2">
                  {subcategoryHasSizeSet ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sizes (comma-separated)</label>
                      <input
                        placeholder="e.g. S,M,L,XL"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={sizesText}
                        onChange={(e) => setSizesText(e.target.value)}
                        title="Enter sizes separated by comma"
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">Measurement image URL (How to measure)</label>
                      <div className="flex gap-2">
                        <input
                          placeholder="https://... (or upload below)"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={measurementImageUrl}
                          onChange={(e) => setMeasurementImageUrl(e.target.value)}
                          title="Measurement image URL"
                        />
                        <input type="file" accept="image/*" onChange={(e) => {
                          const f = e.currentTarget.files?.[0] || null
                          if (f) {
                            // upload immediately
                            const up = async () => {
                              const fd = new FormData(); fd.append('files', f)
                              const r = await fetch('/api/admin/uploads/images', { method: 'POST', body: fd })
                              const j = await r.json().catch(() => ({}))
                              if (r.ok && Array.isArray(j.urls) && j.urls[0]) setMeasurementImageUrl(j.urls[0])
                            }
                            void up()
                          }
                        }} />
                      </div>
                    </div>
                  ) : null}

                  {/* Clothes sizes (optional) */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Clothes sizes (comma-separated)</label>
                    <input
                      placeholder="e.g. XS,S,M,L,XL,XXL"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={clothesSizesText}
                      onChange={(e) => setClothesSizesText(e.target.value)}
                    />
                  </div> */}
                  {/* Shoe sizes (optional) */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Shoe sizes (comma-separated)</label>
                    <input
                      placeholder="e.g. 6,7,8,9,10"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={shoesSizesText}
                      onChange={(e) => setShoesSizesText(e.target.value)}
                    />
                  </div> */}
                  {/* Category specific inputs */}
                  {/* removed category-specific capacity to avoid duplication; using shared Capacity field above */}
                  {isLaptopBag && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Laptop screen inch (e.g. 15-16)</label>
                      <input placeholder="e.g. 15-16" className="w-full border px-3 py-2 rounded" onChange={(e) => updateForm({ ...(form as any), screenInch: e.target.value })} />
                    </div>
                  )}
                  {isWallet && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thickness (mm)</label>
                      <input placeholder="e.g. 10" className="w-full border px-3 py-2 rounded" onChange={(e) => updateForm({ ...(form as any), thickness: e.target.value })} />
                    </div>
                  )}
                  {isBelt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Belt length (cm)</label>
                      <input placeholder="e.g. 120" className="w-full border px-3 py-2 rounded" onChange={(e) => updateForm({ ...(form as any), beltLength: e.target.value })} />
                    </div>
                  )}
                  {isShoe && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shoe sizes (comma-separated)</label>
                      <input placeholder="e.g. 6,7,8,9" className="w-full border px-3 py-2 rounded" onChange={(e) => updateForm({ ...(form as any), shoeSizes: e.target.value })} />
                    </div>
                  )}
                  {isJacket && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jacket measurements notes</label>
                      <textarea placeholder="Enter measurements per size, e.g. S: chest 96cm, length 68cm; M: ..." className="w-full border px-3 py-2 rounded" onChange={(e) => updateForm({ ...(form as any), jacketMeasurements: e.target.value })} />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Features</h4>
                    <button
                      type="button"
                      onClick={() => setFeatures((fs) => [...fs, { title: '', description: '', imageUrl: '' }])}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      + Add feature
                    </button>
                  </div>
                  {/* Size chart for jackets (chest/length) + guidance */}
                  {(isJacket || isBag) && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Size chart (Jackets)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sizeOptions.map((sz) => (
                        <div key={sz} className="p-3 border rounded-lg">
                          <div className="text-xs font-medium text-gray-700 mb-2">{sz}</div>
                          <input
                            type="number"
                            placeholder="Chest (cm)"
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs mb-2"
                            value={sizeChart[sz]?.chest ?? ''}
                            onChange={(e) => setSizeChart((sc) => ({ ...sc, [sz]: { ...(sc[sz] || {}), chest: e.target.value } }))}
                          />
                          <input
                            type="number"
                            placeholder="Length (cm)"
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
                            value={sizeChart[sz]?.length ?? ''}
                            onChange={(e) => setSizeChart((sc) => ({ ...sc, [sz]: { ...(sc[sz] || {}), length: e.target.value } }))}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Size guidance</label>
                      <textarea
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={sizeGuidance}
                        onChange={(e) => setSizeGuidance(e.target.value)}
                        placeholder="e.g. For a regular fit, choose your usual size. If in between sizes, size up."
                      />
                    </div>
                  </div>
                  )}
                  <div className="space-y-3">
                    {features.map((f, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg">
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Feature title"
                          value={f.title}
                          onChange={(e) => {
                            const next = [...features]
                            next[idx] = { ...next[idx], title: e.target.value }
                            setFeatures(next)
                          }}
                        />
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Feature image URL"
                          value={f.imageUrl}
                          onChange={(e) => {
                            const next = [...features]
                            next[idx] = { ...next[idx], imageUrl: e.target.value }
                            setFeatures(next)
                          }}
                        />
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-3"
                          placeholder="Feature description"
                          value={f.description}
                          onChange={(e) => {
                            const next = [...features]
                            next[idx] = { ...next[idx], description: e.target.value }
                            setFeatures(next)
                          }}
                        />
                        <div className="md:col-span-3 text-right">
                          <button
                            type="button"
                            onClick={() => setFeatures((fs) => fs.filter((_, i) => i !== idx))}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              {saving ? 'Saving…' : 'Create product'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Products"
        right={(
          <div className="flex gap-2 items-center">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select title="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory('') }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <select title="Filter by subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All subcategories</option>
              {subcategories.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
            <button onClick={load} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Apply</button>
          </div>
        )}
      >
        <div className="divide-y">
          <div className="grid grid-cols-8 gap-4 px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <div>Title</div>
            <div>Category · Subcategory</div>
            <div>Brand</div>
            <div>Weight</div>
            <div>Materials</div>
            <div className="text-right">Price</div>
            <div className="text-right">Video</div>
            <div className="text-right">Actions</div>
          </div>
          {items.map((p: any) => (
            <div key={p.id} className="grid grid-cols-8 gap-4 px-2 py-3 items-center">
              <div className="font-medium text-black flex items-center gap-2">
                <span>{p.title}</span>
                {typeof (p as any).showInGallery === 'boolean' ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${ (p as any).showInGallery ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200' }`}>
                    {(p as any).showInGallery ? 'In gallery' : 'Hidden from gallery'}
                  </span>
                ) : null}
              </div>
              <div className="text-gray-600">{p.subcategory?.category?.name} / {p.subcategory?.name}</div>
              <div className="text-gray-600">{p.brand?.name || '—'}</div>
              <div className="text-gray-600">{p.weight || '—'}</div>
              <div className="text-gray-600">{Array.isArray(p.materials) ? p.materials.join(', ') : '—'}</div>
              <div className="text-right text-gray-700">{p.currency} {p.price}</div>
              <div className="text-right text-gray-600">{p.videoUrl ? 'Attached' : '—'}</div>
              <div className="flex justify-end gap-3 text-xs">
                <button onClick={() => openEditProduct(p)} className="text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="px-2 py-6 text-gray-500 text-sm">No products found.</div>}
        </div>
      </Card>
      {editingProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Update media for {editingProduct.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Attach or replace the product video shown on the storefront gallery.</p>
            </div>
            {editError ? (
              <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{editError}</div>
            ) : null}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Video URL</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
                value={editVideoUrl}
                onChange={(e) => {
                  setEditVideoUrl(e.target.value)
                  setEditError('')
                }}
                disabled={editSaving}
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{editVideoUrl ? 'Video attached' : 'No video linked'}</span>
                {editVideoUrl ? (
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      setEditVideoUrl('')
                      setEditError('')
                    }}
                    disabled={editSaving || editUploading}
                  >
                    Remove video
                  </button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Upload new video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0] || null
                  e.currentTarget.value = ''
                  if (file) void uploadEditVideo(file)
                }}
                disabled={editUploading || editSaving}
              />
              <p className="text-xs text-gray-500">Videos upload to Cloudinary and update the URL automatically. Existing media stays active until you save.</p>
              {editUploading ? <div className="text-xs text-indigo-600">Uploading…</div> : null}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeEditProduct}
                className="text-sm px-4 py-2 rounded border border-gray-300 text-gray-700"
                disabled={editSaving || editUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditProduct}
                className="text-sm px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                disabled={editSaving || editUploading}
              >
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

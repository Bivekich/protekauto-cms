"use client"

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Upload,
  Download
} from 'lucide-react'
import { CategoryTree } from '@/components/catalog/CategoryTree'
import { ProductList } from '@/components/catalog/ProductList'
import { CategoryForm } from '@/components/catalog/CategoryForm'
import { ProductForm } from '@/components/catalog/ProductForm'
import { GET_CATEGORIES, GET_PRODUCTS } from '@/lib/graphql/queries'
import { EXPORT_PRODUCTS } from '@/lib/graphql/mutations'



export default function CatalogPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(undefined)
  const [editingProduct, setEditingProduct] = useState(undefined)
  const [exportLoading, setExportLoading] = useState(false)

  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useQuery(GET_CATEGORIES)
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_PRODUCTS, {
    variables: {
      categoryId: selectedCategoryId,
      search: searchQuery || undefined,
      limit: 50,
      offset: 0
    }
  })

  const [exportProducts] = useMutation(EXPORT_PRODUCTS)

  const categories = categoriesData?.categories || []
  const products = productsData?.products || []

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryCreated = () => {
    setShowCategoryForm(false)
    setEditingCategory(undefined)
    refetchCategories()
  }

  const handleProductCreated = () => {
    setShowProductForm(false)
    setEditingProduct(undefined)
    refetchProducts()
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const result = await exportProducts({
        variables: {
          categoryId: selectedCategoryId,
          search: searchQuery || undefined
        }
      })
      
      if (result.data?.exportProducts) {
        // Открываем файл в новой вкладке для скачивания
        window.open(result.data.exportProducts.url, '_blank')
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      alert('Не удалось экспортировать товары')
    } finally {
      setExportLoading(false)
    }
  }

  const selectedCategory = selectedCategoryId 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? categories.find((cat: any) => cat.id === selectedCategoryId)
    : null

  return (
    <div className="flex h-full bg-gray-50">
      {/* Левое меню категорий */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Каталог товаров</h2>
          <Button
            onClick={() => setShowCategoryForm(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить категорию
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CategoryTree
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onCategoryEdit={(category: any) => setEditingCategory(category)}
            onCategoryCreated={handleCategoryCreated}
            loading={categoriesLoading}
          />
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 flex flex-col">
        {/* Заголовок и действия */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? selectedCategory.name : 'Все товары'}
              </h1>
              {selectedCategory && (
                <p className="text-sm text-gray-500 mt-1">
                  Категория • {selectedCategory._count?.products || 0} товаров
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Импорт
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={exportLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportLoading ? 'Экспорт...' : 'Экспорт'}
              </Button>
              <Button 
                onClick={() => setShowProductForm(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить товар
              </Button>
            </div>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск товаров по названию, артикулу..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Список товаров */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductList
            products={products}
            loading={productsLoading}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onProductEdit={(product: any) => setEditingProduct(product)}
            onProductCreated={handleProductCreated}
          />
        </div>
      </div>

      {/* Диалоги */}
      <Dialog open={showCategoryForm || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setShowCategoryForm(false)
          setEditingCategory(undefined)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onSuccess={handleCategoryCreated}
            onCancel={() => {
              setShowCategoryForm(false)
              setEditingCategory(undefined)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showProductForm || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setShowProductForm(false)
          setEditingProduct(undefined)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редактировать товар' : 'Создать товар'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSuccess={handleProductCreated}
            onCancel={() => {
              setShowProductForm(false)
              setEditingProduct(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 
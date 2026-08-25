import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Check, Star, Filter, ArrowUpRight, 
  Package, Sparkles, CheckCircle, Info, Heart, Scissors, ShoppingCart,
  Edit3, Trash2, X, AlertTriangle
} from 'lucide-react';
import EditableText from './EditableText';

// Define product interface for the Online Store
export interface ProductChoice {
  label: string;
  priceModifier?: number;
}

export interface ProductOption {
  name: string; // e.g., "種類", "寬度", "長度"
  choices: ProductChoice[];
}

export interface StoreProduct {
  id: string;
  title: string;
  category: 'mens' | 'womens' | 'chemo' | 'accessories';
  categoryLabel: string;
  price: number;
  priceMax?: number; // Optional maximum price for price range display
  imgUrl: string;
  description: string;
  tag: string;
  features?: string[];
  customOptions?: ProductOption[]; // Optional custom options for variations
}

interface OnlineStoreProps {
  onBack: () => void;
  isAdmin: boolean;
  isEditMode: boolean;
  siteContent: Record<string, string>;
  onSave: (key: string, val: string) => void;
  onAddToCart: (product: StoreProduct, options: { size: string; color: string; customPrice?: number }) => void;
}

// Default high-quality accessories & default store items
const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'acc-walker-tape-options',
    title: '【熱銷專區 WALKER TAPE】美國原廠假髮雙面膠帶 (自選種類/寬度/長度)',
    category: 'accessories',
    categoryLabel: '頂級耗材配品',
    price: 350,
    priceMax: 1200,
    imgUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600',
    description: '美國進口假髮專用膠帶大廠 Walker Tape 官方正品。提供多種膠帶款式（紅膠、白膠、紫膠、藍膠、綠膠、No-Shine 無光澤），以及多種常用寬度與長度規格，滿足不同網底及配戴時間的需求。',
    tag: '美國原廠進口',
    customOptions: [
      {
        name: '膠帶種類',
        choices: [
          { label: '紅膠 (Sensi-Tak) - 易清理/低致敏', priceModifier: 0 },
          { label: '藍膠 (Lace Front) - 頂級強效/超薄服貼', priceModifier: 150 },
          { label: '白膠 (Ultra Hold) - 防水防油/超強黏力', priceModifier: 180 },
          { label: '紫膠 (Walker Signature) - 薄透無感/親膚安全', priceModifier: 200 },
          { label: '綠膠 (No-Shine Extension) - 低致敏/霧面微光', priceModifier: 100 },
          { label: 'No-Shine 經典無光澤 - 隱形啞光/不反光', priceModifier: 120 }
        ]
      },
      {
        name: '膠帶寬度',
        choices: [
          { label: '1/2 吋 (1.27 cm) - 細窄款', priceModifier: 0 },
          { label: '3/4 吋 (1.90 cm) - 標準款', priceModifier: 80 },
          { label: '1 吋 (2.54 cm) - 寬幅加強款', priceModifier: 150 }
        ]
      },
      {
        name: '膠帶長度',
        choices: [
          { label: '3 碼 (3 Yards) - 體驗包', priceModifier: 0 },
          { label: '12 碼 (12 Yards) - 實惠裝', priceModifier: 250 },
          { label: '36 碼 (36 Yards) - 大容量省錢專區', priceModifier: 500 }
        ]
      }
    ]
  },
  {
    id: 'acc-walker-tape',
    title: '美國進口 Walker Tape 藍帶強效雙面膠 (頂級長效)',
    category: 'accessories',
    categoryLabel: '頂級耗材配品',
    price: 480,
    imgUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600',
    description: '美國第一品牌 Walker Tape 官方正品。專為真人髮片網底設計，防汗防水，黏性可維持 2-4 週，低致敏親膚材質，無感無重力服貼。',
    tag: '運動防汗首選'
  },
  {
    id: 'acc-c22-solvent',
    title: 'C-22 柑橘極速除膠噴霧 (專業沙龍專用)',
    category: 'accessories',
    categoryLabel: '頂級耗材配品',
    price: 680,
    imgUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600&h=600',
    description: '天然柑橘配方，高效溫和，不傷網底與髮絲。能在一分鐘內快速分解殘膠，氣味芬芳清爽，清水一沖即淨，新手清膠神器。',
    tag: '溫和速效除膠'
  },
  {
    id: 'acc-wig-stand',
    title: '可折疊防變形假髮支撐架 (亮銀尊榮款)',
    category: 'accessories',
    categoryLabel: '收納保養器具',
    price: 320,
    imgUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600&h=600',
    description: '專利懸空支撐設計，防止手工髮片長時間放置導致底網變形。通風透氣，洗髮後晾乾必備，折疊收納極省空間。',
    tag: '網底防護專家'
  },
  {
    id: 'acc-care-comb',
    title: '大衛哥特製防靜電排骨梳 (真髮不打結)',
    category: 'accessories',
    categoryLabel: '收納保養器具',
    price: 250,
    imgUrl: 'https://images.unsplash.com/photo-1590156546746-c22224b6931d?auto=format&fit=crop&q=80&w=600&h=600',
    description: '高回彈柔軟圓頭鋼齒，絕不刮傷絲綢蠶絲底網。寬齒防靜電設計，能輕鬆梳開微捲度與髮尾，長效維持假髮蓬鬆弧度。',
    tag: '真髮專用防打結'
  }
];

export default function OnlineStore({
  onBack,
  isAdmin,
  isEditMode,
  siteContent,
  onSave,
  onAddToCart
}: OnlineStoreProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mens' | 'womens' | 'chemo' | 'accessories'>('all');
  const [wigsLoading, setWigsLoading] = useState(true);
  
  // Dialog configuration
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('自然黑');
  const [customSelections, setCustomSelections] = useState<Record<string, string>>({});
  const [addedMessage, setAddedMessage] = useState<string>('');

  // Admin states for adding new shop products
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [addCategory, setAddCategory] = useState<'mens' | 'womens' | 'chemo' | 'accessories'>('accessories');
  const [addPrice, setAddPrice] = useState<number>(500);
  const [addPriceMax, setAddPriceMax] = useState<string>('');
  const [addCustomOptionsText, setAddCustomOptionsText] = useState<string>('');
  const [addImgUrl, setAddImgUrl] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addTag, setAddTag] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Admin states for editing products
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'mens' | 'womens' | 'chemo' | 'accessories'>('accessories');
  const [editPrice, setEditPrice] = useState<number>(500);
  const [editPriceMax, setEditPriceMax] = useState<string>('');
  const [editCustomOptionsText, setEditCustomOptionsText] = useState<string>('');
  const [editImgUrl, setEditImgUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTag, setEditTag] = useState('');

  // Non-blocking custom alert and confirm dialog configurations
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  const [confirmConfig, setConfirmConfig] = useState<{ show: boolean; title: string; message: string; onConfirm: (() => void) | null }>({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertConfig({ show: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ show: true, title, message, onConfirm });
  };

  // Parser and Formatter for Product Options
  const parseCustomOptionsText = (text: string): ProductOption[] => {
    if (!text.trim()) return [];
    const lines = text.split(/[\n;]/).map(l => l.trim()).filter(Boolean);
    const options: ProductOption[] = [];
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;
      
      const name = line.substring(0, colonIndex).trim();
      const choicesPart = line.substring(colonIndex + 1).trim();
      if (!name || !choicesPart) return;
      
      const choiceStrings = choicesPart.split(',').map(c => c.trim()).filter(Boolean);
      const choices: ProductChoice[] = [];
      
      choiceStrings.forEach(choiceStr => {
        const match = choiceStr.match(/^(.*?)\s*\(([+-]\d+)\)$/);
        let label = choiceStr;
        let priceModifier = 0;
        
        if (match) {
          label = match[1].trim();
          priceModifier = parseInt(match[2], 10) || 0;
        }
        
        choices.push({ label, priceModifier });
      });
      
      if (choices.length > 0) {
        options.push({ name, choices });
      }
    });
    
    return options;
  };

  const formatCustomOptionsToText = (options?: ProductOption[]): string => {
    if (!options || options.length === 0) return '';
    return options.map(opt => {
      const choicesStr = opt.choices.map(c => {
        if (c.priceModifier) {
          return `${c.label} (${c.priceModifier > 0 ? '+' : ''}${c.priceModifier})`;
        }
        return c.label;
      }).join(', ');
      return `${opt.name}: ${choicesStr}`;
    }).join('\n');
  };

  const getProductPriceDisplay = (product: StoreProduct) => {
    if (product.priceMax && product.priceMax > product.price) {
      return `NT$ ${product.price.toLocaleString()} - ${product.priceMax.toLocaleString()}`;
    }
    
    if (product.customOptions && product.customOptions.length > 0) {
      let minPrice = product.price;
      let maxPrice = product.price;
      
      product.customOptions.forEach(opt => {
        const modifiers = opt.choices.map(c => c.priceModifier || 0);
        if (modifiers.length > 0) {
          const minMod = Math.min(...modifiers);
          const maxMod = Math.max(...modifiers);
          minPrice += minMod;
          maxPrice += maxMod;
        }
      });
      
      if (maxPrice > minPrice) {
        return `NT$ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
      }
    }
    
    return `NT$ ${product.price.toLocaleString()}`;
  };

  const getCalculatedPrice = () => {
    if (!selectedProduct) return 0;
    let basePrice = selectedProduct.price;
    if (selectedProduct.customOptions && selectedProduct.customOptions.length > 0) {
      selectedProduct.customOptions.forEach(opt => {
        const selectedVal = customSelections[opt.name] || opt.choices[0]?.label;
        const choice = opt.choices.find(c => c.label === selectedVal);
        if (choice && choice.priceModifier) {
          basePrice += choice.priceModifier;
        }
      });
    }
    return basePrice;
  };

  // Load products from backend wigs catalog & combine with accessories
  const fetchAllProducts = async () => {
    try {
      setWigsLoading(true);
      const res = await fetch('/api/wigs');
      let combined: StoreProduct[] = [];
      
      if (res.ok) {
        const dbWigs = await res.json();
        // Map db wigs to store products
        const mappedWigs: StoreProduct[] = dbWigs.map((wig: any) => ({
          id: wig.id,
          title: wig.title,
          category: wig.type === 'mens' ? 'mens' : (wig.type === 'womens' ? 'womens' : 'chemo'),
          categoryLabel: wig.categoryLabel || '手工訂製髮片',
          price: wig.priceType === 'ready' ? 18800 : 32800,
          imgUrl: wig.imgUrl || 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=600&h=600',
          description: wig.description || '頂級手工鉤編真人髮片，通風、透氣、無感服貼。',
          tag: wig.tag || '手工量身微雕'
        }));
        
        // Load custom accessories saved in localStorage or use default
        const savedCustom = localStorage.getItem('david_custom_shop_products');
        const customProducts: StoreProduct[] = savedCustom ? JSON.parse(savedCustom) : [];
        
        combined = [...mappedWigs, ...DEFAULT_STORE_PRODUCTS, ...customProducts];
      } else {
        const savedCustom = localStorage.getItem('david_custom_shop_products');
        const customProducts: StoreProduct[] = savedCustom ? JSON.parse(savedCustom) : [];
        combined = [...DEFAULT_STORE_PRODUCTS, ...customProducts];
      }

      // Merge edits from localStorage
      const savedEdits = localStorage.getItem('david_edited_shop_products');
      const editedProductsMap: Record<string, Partial<StoreProduct>> = savedEdits ? JSON.parse(savedEdits) : {};
      
      const mergedProducts = combined.map(p => {
        if (editedProductsMap[p.id]) {
          return { ...p, ...editedProductsMap[p.id] };
        }
        return p;
      });

      // Filter out deleted ones
      const deletedIds: string[] = JSON.parse(localStorage.getItem('david_deleted_shop_products') || '[]');
      setProducts(mergedProducts.filter(p => !deletedIds.includes(p.id)));
    } catch (err) {
      console.error("Failed to load shop products:", err);
      const savedCustom = localStorage.getItem('david_custom_shop_products');
      const customProducts: StoreProduct[] = savedCustom ? JSON.parse(savedCustom) : [];
      const combined = [...DEFAULT_STORE_PRODUCTS, ...customProducts];
      
      const savedEdits = localStorage.getItem('david_edited_shop_products');
      const editedProductsMap: Record<string, Partial<StoreProduct>> = savedEdits ? JSON.parse(savedEdits) : {};
      
      const mergedProducts = combined.map(p => {
        if (editedProductsMap[p.id]) {
          return { ...p, ...editedProductsMap[p.id] };
        }
        return p;
      });

      const deletedIds: string[] = JSON.parse(localStorage.getItem('david_deleted_shop_products') || '[]');
      setProducts(mergedProducts.filter(p => !deletedIds.includes(p.id)));
    } finally {
      setWigsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      showAlert('請輸入網址', '請輸入原站的商品網址！', 'error');
      return;
    }
    setIsImporting(true);
    try {
      const res = await fetch(`/api/import-product?url=${encodeURIComponent(importUrl.trim())}`);
      if (!res.ok) {
        throw new Error('解析失敗');
      }
      const data = await res.json();
      
      setAddTitle(data.title || '');
      setAddPrice(data.price || 0);
      setAddPriceMax(data.priceMax ? String(data.priceMax) : '');
      setAddImgUrl(data.imgUrl || '');
      setAddDescription(data.description || '');
      setAddTag(data.tag || '');
      setAddCategory(data.category || 'accessories');
      
      if (data.customOptions && data.customOptions.length > 0) {
        const formatted = data.customOptions.map((opt: any) => {
          const choicesStr = opt.choices.map((choice: any) => {
            if (choice.priceModifier) {
              const sign = choice.priceModifier > 0 ? '+' : '';
              return `${choice.label} (${sign}${choice.priceModifier})`;
            }
            return choice.label;
          }).join(', ');
          return `${opt.name}: ${choicesStr}`;
        }).join('\n');
        setAddCustomOptionsText(formatted);
      } else {
        setAddCustomOptionsText('');
      }
      
      showAlert('解析成功！', '已成功自原站抓取並填入商品欄位與客製多重規格！', 'success');
    } catch (err) {
      console.error(err);
      showAlert('解析失敗', '無法解析該網址，請確認網址是否正確。', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) {
      showAlert('欄位未填', '請填寫商品名稱！', 'error');
      return;
    }
    setSubmittingProduct(true);
    try {
      const priceMaxVal = addPriceMax.trim() ? Number(addPriceMax) : undefined;
      const customOptions = parseCustomOptionsText(addCustomOptionsText);

      const newProd: StoreProduct = {
        id: 'shop_custom_' + Date.now(),
        title: addTitle.trim(),
        category: addCategory,
        categoryLabel: addCategory === 'accessories' ? '自主添加耗材' : '自主添加款式',
        price: Number(addPrice) || 990,
        priceMax: priceMaxVal,
        customOptions: customOptions.length > 0 ? customOptions : undefined,
        imgUrl: addImgUrl.trim() || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600&h=600',
        description: addDescription.trim() || '大衛哥嚴選優質商品，為您的髮片提供全方位的頂級防護與保養。',
        tag: addTag.trim() || '大衛推薦'
      };

      const savedCustom = localStorage.getItem('david_custom_shop_products');
      const customProducts: StoreProduct[] = savedCustom ? JSON.parse(savedCustom) : [];
      const updated = [newProd, ...customProducts];
      localStorage.setItem('david_custom_shop_products', JSON.stringify(updated));
      
      // Reload list
      fetchAllProducts();
      
      // Reset form
      setAddTitle('');
      setAddPriceMax('');
      setAddCustomOptionsText('');
      setAddImgUrl('');
      setAddDescription('');
      setAddTag('');
      setShowAddModal(false);
      showAlert('商品上架成功', '商品上架成功！已同步至商品清單。', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleRemoveProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      '確認下架商品',
      '確定要下架此商品嗎？下架後該商品將不再對顧客顯示。',
      async () => {
        try {
          // 1. If it's a database wig, call backend delete
          if (!id.startsWith('shop_custom_') && !id.startsWith('acc-')) {
            const res = await fetch(`/api/wigs/${id}`, {
              method: 'DELETE'
            });
            if (!res.ok) {
              console.error("Failed to delete wig from backend db");
            }
          }
          
          // 2. If it is a custom product, also remove from custom list
          if (id.startsWith('shop_custom_')) {
            const savedCustom = localStorage.getItem('david_custom_shop_products');
            if (savedCustom) {
              const customProducts: StoreProduct[] = JSON.parse(savedCustom);
              const filtered = customProducts.filter(p => p.id !== id);
              localStorage.setItem('david_custom_shop_products', JSON.stringify(filtered));
            }
          }
          
          // 3. Keep track of deleted product ID to hide it from defaults/cache
          const deletedIds: string[] = JSON.parse(localStorage.getItem('david_deleted_shop_products') || '[]');
          if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('david_deleted_shop_products', JSON.stringify(deletedIds));
          }
          
          showAlert('成功下架', '商品已成功下架！', 'success');
          fetchAllProducts();
        } catch (err) {
          console.error("Error deleting product:", err);
          showAlert('下架失敗', '下架商品失敗，請稍後再試。', 'error');
        }
      }
    );
  };

  const handleResetStoreDefaults = () => {
    showConfirm(
      '重設商品資料庫',
      '確定要清除所有商品自訂資料（包括自訂上架、自訂編輯與下架紀錄）並恢復為最初始的預設商品嗎？此操作不可逆。',
      () => {
        localStorage.removeItem('david_custom_shop_products');
        localStorage.removeItem('david_deleted_shop_products');
        localStorage.removeItem('david_edited_shop_products');
        showAlert('重設成功', '商品資料已恢復為預設狀態！', 'success');
        fetchAllProducts();
      }
    );
  };

  const handleOpenEditProduct = (product: StoreProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditCategory(product.category);
    setEditPrice(product.price);
    setEditPriceMax(product.priceMax ? String(product.priceMax) : '');
    setEditCustomOptionsText(formatCustomOptionsToText(product.customOptions));
    setEditImgUrl(product.imgUrl);
    setEditDescription(product.description);
    setEditTag(product.tag);
    setShowEditModal(true);
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editTitle.trim()) {
      showAlert('欄位未填', '請填寫商品名稱！', 'error');
      return;
    }

    setSubmittingProduct(true);
    try {
      const id = editingProduct.id;
      const priceMaxVal = editPriceMax.trim() ? Number(editPriceMax) : undefined;
      const customOptions = parseCustomOptionsText(editCustomOptionsText);

      const updatedFields: Partial<StoreProduct> = {
        title: editTitle.trim(),
        category: editCategory,
        categoryLabel: editCategory === 'accessories' ? '專用耗材與保養' : (editCategory === 'mens' ? '男性手工髮片' : (editCategory === 'womens' ? '女性美髮片' : '化療醫療專區')),
        price: Number(editPrice) || 0,
        priceMax: priceMaxVal || undefined,
        customOptions: customOptions.length > 0 ? customOptions : [],
        imgUrl: editImgUrl.trim() || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600&h=600',
        description: editDescription.trim() || '大衛哥嚴選優質商品，為您的髮片提供全方位的頂級防護與保養。',
        tag: editTag.trim() || '大衛推薦'
      };

      // 1. If it's a database wig, send update to backend
      if (!id.startsWith('shop_custom_') && !id.startsWith('acc-')) {
        const res = await fetch('/api/wigs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: id,
            title: editTitle.trim(),
            type: editCategory,
            imgUrl: editImgUrl.trim(),
            description: editDescription.trim(),
            tag: editTag.trim(),
            priceType: editPrice >= 30000 ? 'custom' : 'ready'
          })
        });
        if (!res.ok) {
          console.error("Failed to edit wig in backend db");
        }
      }

      // 2. If it is a custom product, also update custom products list
      if (id.startsWith('shop_custom_')) {
        const savedCustom = localStorage.getItem('david_custom_shop_products');
        if (savedCustom) {
          const customProducts: StoreProduct[] = JSON.parse(savedCustom);
          const updated = customProducts.map(p => {
            if (p.id === id) {
              return { ...p, ...updatedFields };
            }
            return p;
          });
          localStorage.setItem('david_custom_shop_products', JSON.stringify(updated));
        }
      }

      // 3. Keep track of edited product ID/fields to persist locally
      const savedEdits = localStorage.getItem('david_edited_shop_products');
      const editedProductsMap: Record<string, Partial<StoreProduct>> = savedEdits ? JSON.parse(savedEdits) : {};
      editedProductsMap[id] = updatedFields;
      localStorage.setItem('david_edited_shop_products', JSON.stringify(editedProductsMap));

      showAlert('商品已成功更新', '商品資訊已成功同步更新！', 'success');
      setShowEditModal(false);
      setEditingProduct(null);
      fetchAllProducts();
    } catch (err) {
      console.error("Error editing product:", err);
      showAlert('更新失敗', '更新商品失敗，請稍後再試。', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  const triggerAddToCart = (product: StoreProduct) => {
    let finalSize = selectedSize;
    let finalColor = selectedColor;
    
    if (product.customOptions && product.customOptions.length > 0) {
      const optPairs = product.customOptions.map(opt => {
        const val = customSelections[opt.name] || opt.choices[0]?.label;
        return `${opt.name}: ${val}`;
      });
      finalSize = optPairs[0] || '通用規格';
      finalColor = optPairs.slice(1).join(' / ') || '預設規格';
    }
    
    const finalPrice = getCalculatedPrice();
    onAddToCart(product, { size: finalSize, color: finalColor, customPrice: finalPrice });
    setAddedMessage(`🎉 已將 ${product.title} (${finalSize}${finalColor !== '預設規格' && finalColor ? ` / ${finalColor}` : ''}) 加入購物車！`);
    setSelectedProduct(null);
    setTimeout(() => setAddedMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24">
      {/* Premium Hero Banner */}
      <div className="bg-zinc-950 text-white relative overflow-hidden py-16 sm:py-24 px-4 border-b border-zinc-900">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-80 h-80 bg-zinc-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4">
          <span className="px-3 py-1 bg-brand-500 text-zinc-950 font-black rounded-lg text-xs uppercase tracking-widest inline-block select-none">
            David Hair Wig Store
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
            大衛假髮 — 線上購物商城
          </h1>
          <p className="text-zinc-400 font-light text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            嚴選 100% Remy 真人髮絲手織髮片與美國 Walker Tape 進口耗材，全台直營門市規格保障，購物即享精修指導，重返魅力無負擔。
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              ← 返回品牌首頁
            </button>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  ＋ 自行上架商品
                </button>
                <button
                  onClick={handleResetStoreDefaults}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-red-500/40 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="清除所有的修改/上架/下架紀錄，恢復成出廠預設值"
                >
                  ⚙️ 重設商品至預設
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Added Message Banner */}
        <AnimatePresence>
          {addedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              {addedMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-zinc-200 pb-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: '全部商品' },
              { id: 'mens', label: '男性手工髮片' },
              { id: 'womens', label: '女性美髮片' },
              { id: 'chemo', label: '化療醫療專區' },
              { id: 'accessories', label: '專用耗材與保養' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id 
                    ? 'bg-[#8e7a64] text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-zinc-500 font-extrabold">
            共顯示 <span className="text-[#8e7a64] font-black text-sm">{filteredProducts.length}</span> 款商品
          </div>
        </div>

        {/* Products Grid */}
        {wigsLoading ? (
          <div className="bg-white rounded-3xl p-24 border border-zinc-200 text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#8e7a64] border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-bold">載入商品資料庫中，請稍候...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layoutId={`store-card-${product.id}`}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl overflow-hidden border border-zinc-200/60 shadow-md hover:shadow-xl transition-all flex flex-col group relative"
              >
                {/* Category tag */}
                <div className="absolute top-3 left-3 z-10 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.categoryLabel}
                </div>

                {/* Product admin actions badge */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                    <button
                      onClick={(e) => handleOpenEditProduct(product, e)}
                      className="bg-white/95 hover:bg-amber-500 text-zinc-800 hover:text-zinc-950 p-1.5 rounded-full border border-zinc-200 shadow hover:scale-105 transition-all cursor-pointer"
                      title="編輯此商品"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveProduct(product.id, e)}
                      className="bg-white/95 hover:bg-red-600 text-zinc-800 hover:text-white p-1.5 rounded-full border border-zinc-200 shadow hover:scale-105 transition-all cursor-pointer animate-none"
                      title="下架此商品"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Product Image */}
                <div className="h-56 bg-zinc-100 overflow-hidden relative shrink-0">
                  <img loading="lazy" decoding="async"
                    src={product.imgUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Card Info */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-amber-700 font-black tracking-wider uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {product.tag}
                    </span>
                    <h3 className="font-extrabold text-zinc-900 text-sm sm:text-base leading-snug group-hover:text-[#8e7a64] transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-zinc-500 text-xs line-clamp-2 font-normal">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">售價 NTD</p>
                      <p className="text-base sm:text-lg font-black text-[#8e7a64] font-mono">
                        {getProductPriceDisplay(product)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        // Reset defaults
                        setSelectedSize(product.category === 'accessories' ? '通用規格' : 'M');
                        setSelectedColor(product.category === 'accessories' ? '無色/透明' : '自然黑');
                        
                        // Set default custom selections
                        const initialSelections: Record<string, string> = {};
                        if (product.customOptions) {
                          product.customOptions.forEach(opt => {
                            if (opt.choices && opt.choices[0]) {
                              initialSelections[opt.name] = opt.choices[0].label;
                            }
                          });
                        }
                        setCustomSelections(initialSelections);
                      }}
                      className="px-3 py-2 bg-[#8e7a64] hover:bg-[#726250] text-white text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow hover:shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      立即購買
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 border border-zinc-200 text-center space-y-3 shadow-sm flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-zinc-300" />
            <p className="text-zinc-800 font-black text-lg">此分類目前尚無商品上架</p>
            <p className="text-zinc-500 text-sm max-w-sm">
              如果您是超級管理者 (David)，您可以點擊上方「自行上架商品」按鈕，快速填寫商品規格並即時同步。
            </p>
          </div>
        )}
      </div>

      {/* Option Selection Dialog / Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full relative z-10 border border-zinc-100 flex flex-col"
            >
              {/* Header block with image */}
              <div className="h-48 relative bg-zinc-100">
                <img loading="lazy" decoding="async"
                  src={selectedProduct.imgUrl}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent flex flex-col justify-end p-6 text-white text-left pointer-events-none">
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-400 bg-brand-500/15 border border-brand-500/35 px-2.5 py-0.5 rounded self-start mb-1.5">
                    {selectedProduct.categoryLabel}
                  </span>
                  <h3 className="font-extrabold text-xl sm:text-2xl line-clamp-1">{selectedProduct.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-zinc-950/75 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer z-[60] shadow-md hover:scale-105 transition-all flex items-center justify-center"
                  title="關閉"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 text-left max-h-[50vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <p className="text-zinc-400 text-xs font-bold uppercase">商品說明 Product Specs</p>
                  <p className="text-zinc-600 text-sm leading-relaxed font-normal">{selectedProduct.description}</p>
                </div>

                {/* Custom Options (e.g. Walker Tape types, widths, lengths) or standard Sizes/Colors */}
                {selectedProduct.customOptions && selectedProduct.customOptions.length > 0 ? (
                  selectedProduct.customOptions.map((opt, optIdx) => {
                    const selectedVal = customSelections[opt.name] || opt.choices[0]?.label;
                    return (
                      <div key={optIdx} className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          ⚙️ 選擇{opt.name} ({opt.name})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {opt.choices.map((choice, cIdx) => {
                            const isSelected = selectedVal === choice.label;
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => {
                                  setCustomSelections(prev => ({
                                    ...prev,
                                    [opt.name]: choice.label
                                  }));
                                }}
                                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between h-16 ${
                                  isSelected
                                    ? 'border-[#8e7a64] bg-[#8e7a64]/10 text-[#8e7a64] ring-2 ring-[#8e7a64]/20'
                                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600 bg-white font-normal'
                                }`}
                              >
                                <span className="line-clamp-1 font-extrabold">{choice.label}</span>
                                {choice.priceModifier !== undefined && choice.priceModifier !== 0 && (
                                  <span className={`text-[10px] ${isSelected ? 'text-[#8e7a64]' : 'text-zinc-400'} font-black`}>
                                    {choice.priceModifier > 0 ? `+NT$ ${choice.priceModifier}` : `-NT$ ${Math.abs(choice.priceModifier)}`}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Sizes option (applicable only to non-accessories) */}
                    {selectedProduct.category !== 'accessories' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                          📏 選擇規格/尺寸 (Size Option)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'S', label: '精緻小號 (S)' },
                            { id: 'M', label: '標準型號 (M)' },
                            { id: 'L', label: '大氣寬幅 (L)' },
                            { id: 'custom', label: '量身客製量模' }
                          ].map(sz => (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => setSelectedSize(sz.id)}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                selectedSize === sz.id
                                  ? 'border-[#8e7a64] bg-[#8e7a64]/10 text-[#8e7a64] ring-2 ring-[#8e7a64]/20'
                                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                              }`}
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                          📏 選擇規格/尺寸 (Size Option)
                        </label>
                        <div className="grid grid-cols-1">
                          <button
                            type="button"
                            disabled
                            className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-[#8e7a64] text-left"
                          >
                            ✓ 通用耗材專屬規格 (One Size / Universal Standard)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Colors option (applicable only to non-accessories) */}
                    {selectedProduct.category !== 'accessories' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                          🎨 選擇髮色 (Color Option)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: '自然黑', label: '自然黑髮' },
                            { id: '深棕色', label: '古典深棕' },
                            { id: '栗子色', label: '時尚栗棕' },
                            { id: '客製染', label: '送店客製染' }
                          ].map(col => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => setSelectedColor(col.id)}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                selectedColor === col.id
                                  ? 'border-[#8e7a64] bg-[#8e7a64]/10 text-[#8e7a64] ring-2 ring-[#8e7a64]/20'
                                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                              }`}
                            >
                              {col.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                          🎨 顏色規格 (Color Option)
                        </label>
                        <div className="grid grid-cols-1">
                          <button
                            type="button"
                            disabled
                            className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-[#8e7a64] text-left"
                          >
                            ✓ 無色/透明配方 (Transparent Formula)
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer pricing and button */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">結帳估算金額</p>
                  <p className="text-2xl font-black text-[#8e7a64] font-mono">
                    ${getCalculatedPrice().toLocaleString()} <span className="text-xs text-zinc-500 font-bold">NTD</span>
                  </p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAddToCart(selectedProduct)}
                    className="flex-1 sm:flex-none px-8 py-3 bg-[#8e7a64] hover:bg-[#726250] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-[#8e7a64]/15 flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    確認加入購物車
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-zinc-950/70"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative z-10 border border-zinc-200 p-6 text-left overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-xl font-black text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
                📦 超級管理者 — 新增購物商城商品
              </h3>
              
              <form onSubmit={handleAddNewProduct} className="space-y-4">
                {/* Smart URL Import Bar */}
                <div className="bg-[#8e7a64]/5 rounded-2xl p-3.5 border border-[#8e7a64]/20 space-y-2">
                  <label className="text-[11px] font-black text-[#8e7a64] uppercase tracking-wider flex items-center gap-1.5">
                    🔗 快速從大衛原創官網導入
                  </label>
                  <p className="text-[10px] text-zinc-500 font-bold leading-normal">
                    支援大衛假髮或 WACA 規格商品，會自動爬取標題、最低價/最高價、主圖、詳細介紹並匯入膠帶自訂規格選項。
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="貼上如：https://www.davidhair.com.tw/h/Product?key=p5m4u..."
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white focus:border-[#8e7a64] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleImportFromUrl}
                      disabled={isImporting}
                      className="px-4 py-2 bg-[#8e7a64] hover:bg-[#726250] text-white text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {isImporting ? '抓取解析中...' : '自動解析填入'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    商品名稱 Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如: 美國 Walker Tape 藍帶膠"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      商品分類 Category *
                    </label>
                    <select
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value as any)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    >
                      <option value="accessories">專用耗材與保養</option>
                      <option value="mens">男性手工髮片</option>
                      <option value="womens">女性美髮片</option>
                      <option value="chemo">化療醫療專區</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      基本/最低售價 Min Price (NTD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={addPrice}
                      onChange={(e) => setAddPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      最高售價 Max Price (NTD) (選填)
                    </label>
                    <input
                      type="number"
                      placeholder="留空表示單一價格"
                      min={0}
                      value={addPriceMax}
                      onChange={(e) => setAddPriceMax(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      宣傳標籤 Tag
                    </label>
                    <input
                      type="text"
                      placeholder="例如: 爆款回購、透氣防汗"
                      value={addTag}
                      onChange={(e) => setAddTag(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex justify-between">
                    <span>商品自訂多選項規格 Custom Options (選填)</span>
                    <span className="text-zinc-400 font-normal">每行一組選項</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="格式：膠帶寬度: 1/2吋, 3/4吋(+80), 1吋(+150)"
                    value={addCustomOptionsText}
                    onChange={(e) => setAddCustomOptionsText(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none resize-none"
                  />
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    💡 <strong>格式範例：</strong><br />
                    膠帶種類: 紅膠, 藍膠(+150), 白膠(+180)<br />
                    膠帶長度: 3碼, 12碼(+250), 36碼(+500)
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    商品圖片連結 Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={addImgUrl}
                    onChange={(e) => setAddImgUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    詳細商品描述 Description (選填)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="請輸入詳盡的商品亮點與使用說明（非必填）..."
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 text-zinc-950 text-xs font-black rounded-xl duration-150 cursor-pointer shadow-md"
                  >
                    {submittingProduct ? '上架中...' : '確認上架商品'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Edit Product Modal */}
      <AnimatePresence>
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-zinc-950/70"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative z-10 border border-zinc-200 p-6 text-left overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-xl font-black text-zinc-900 border-b border-zinc-100 pb-3 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                超級管理者 — 編輯商品資訊
              </h3>
              
              <form onSubmit={handleEditProductSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    商品名稱 Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="請輸入商品名稱"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      商品分類 Category *
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    >
                      <option value="accessories">專用耗材與保養</option>
                      <option value="mens">男性手工髮片</option>
                      <option value="womens">女性美髮片</option>
                      <option value="chemo">化療醫療專區</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      基本/最低售價 Min Price (NTD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      最高售價 Max Price (NTD) (選填)
                    </label>
                    <input
                      type="number"
                      placeholder="留空表示單一價格"
                      min={0}
                      value={editPriceMax}
                      onChange={(e) => setEditPriceMax(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      宣傳標籤 Tag
                    </label>
                    <input
                      type="text"
                      placeholder="例如: 爆款回購、透氣防汗"
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex justify-between">
                    <span>商品自訂多選項規格 Custom Options (選填)</span>
                    <span className="text-zinc-400 font-normal">每行一組選項</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="格式：膠帶寬度: 1/2吋, 3/4吋(+80), 1吋(+150)"
                    value={editCustomOptionsText}
                    onChange={(e) => setEditCustomOptionsText(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none resize-none"
                  />
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    💡 <strong>格式範例：</strong><br />
                    膠帶種類: 紅膠, 藍膠(+150), 白膠(+180)<br />
                    膠帶長度: 3碼, 12碼(+250), 36碼(+500)
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    商品圖片連結 Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={editImgUrl}
                    onChange={(e) => setEditImgUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    詳細商品描述 Description (選填)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="請輸入詳盡的商品亮點與使用說明（非必填）..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#8e7a64] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                    className="px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 text-zinc-950 text-xs font-black rounded-xl duration-150 cursor-pointer shadow-md"
                  >
                    {submittingProduct ? '更新中...' : '確認更新商品'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmConfig.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full relative z-10 border border-zinc-200 p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-200">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              
              <h3 className="text-lg font-black text-zinc-900 mb-2">
                {confirmConfig.title}
              </h3>
              
              <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                {confirmConfig.message}
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmConfig.onConfirm) confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-red-600/10"
                >
                  確認
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertConfig.show && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertConfig(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full relative z-10 border border-zinc-200 p-6 text-center"
            >
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
                alertConfig.type === 'error' 
                  ? 'bg-red-50 border-red-200 text-red-600' 
                  : (alertConfig.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
              }`}>
                {alertConfig.type === 'error' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              
              <h3 className="text-lg font-black text-zinc-900 mb-2">
                {alertConfig.title}
              </h3>
              
              <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                {alertConfig.message}
              </p>
              
              <button
                type="button"
                onClick={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black transition-all cursor-pointer"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Search, SlidersHorizontal, ArrowLeft, ArrowUpRight, ArrowDown,
  CheckCircle2, Sparkles, Activity, Star, MessageCircle, 
  Check, Ruler, Clock, Plus, Lock, Heart, Smile,
  ChevronLeft, ChevronRight, Trash2, Loader2, Feather, ShieldCheck,
  Sparkle, Layers, Cpu, AlertCircle
} from 'lucide-react';
import { ChemoWigProduct } from '../types';
import EditableText from './EditableText';

// Standard medical grade default products
const DEFAULT_CHEMO_PRODUCTS: ChemoWigProduct[] = [
  {
    id: 'chemo-silk-deluxe-full',
    title: '「醫療防敏・純蠶絲全頭手工假髮」 (Medical Silk Deluxe Full Wig)',
    category: 'silk-comfort',
    categoryLabel: '極緻蠶絲低敏',
    baseMaterial: 'double',
    baseMaterialLabel: '雙層蠶絲透氣底網',
    priceType: 'custom',
    tag: '極柔親膚・全頭手工・0%壓迫感',
    description: '專為化療落髮及高度敏感頭皮研發。採用物理低敏天然桑蠶絲包覆底網，零化學膠水接觸，針針純手工單針遞針精織。觸感如雲朵般細緻，全天候維持透氣涼爽，無重力減壓設計讓脆弱頭皮安心呼吸。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '100% 物理低敏感天然桑蠶絲親膚打底，零刺激不悶癢',
      '純手工單根遞針勾織，呈現天生毛囊與自然頭皮血色',
      '100% Remy 特優級純淨少女真髮，自然柔順可自由吹整修剪',
      '3D 彈力微孔內網結構，全方位排汗透氣，炎夏配戴零負擔'
    ],
    stylingTips: '建議使用弱酸性溫和洗髮精平鋪輕按清洗，自然陰乾後輕輕梳理即可恢復柔順光澤。',
    bestFit: '即將或正在進行化學治療、放射治療、全頭禿、斑禿或頭皮極度脆弱敏弱之人士。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'chemo-light-topper',
    title: '「醫療過渡・頂部微增透氣髮片」 (Medical Recovery Light Topper)',
    category: 'breathable-cap',
    categoryLabel: '輕盈過渡修復',
    baseMaterial: 'double',
    baseMaterialLabel: '超薄雙層透氣底網',
    priceType: 'custom',
    tag: '生長過渡期・輕量減壓',
    description: '針對化療康復後新髮萌芽期、或局部落髮病友設計。不壓迫新生細軟毛囊，以極輕量微夾或親膚自適應固定，瞬間遮蓋稀疏分線，陪伴您安心走過毛囊修復期。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '專為新生細軟毛囊設計，保留充分生長呼吸空間',
      '專利親膚微型自適應夾扣，牢固不扯原生髮',
      '100% 真人真髮，與原本髮流及髮色自然無痕揉合',
      '極致羽量化設計，重量僅約 25g，佩戴宛如無物'
    ],
    stylingTips: '洗後使用圓梳吹整分線，可隨意切換中分或側分。',
    bestFit: '療程結束後毛髮重新生長過渡期、圓形禿、產後落髮或頂部局部稀疏者。',
    lifeSpan: '18 - 24 個月'
  }
];

interface ChemoWigCatalogProps {
  onBack: () => void;
  isAdmin?: boolean;
  onRequestLogin?: () => void;
  isEditMode?: boolean;
  siteContent?: Record<string, string>;
  onSave?: (key: string, val: string) => void;
}

export default function ChemoWigCatalog({ 
  onBack, 
  isAdmin = false, 
  onRequestLogin,
  isEditMode = false,
  siteContent = {},
  onSave
}: ChemoWigCatalogProps) {
  const [products, setProducts] = useState<ChemoWigProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Detail modal state
  const [selectedProduct, setSelectedProduct] = useState<ChemoWigProduct | null>(null);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('極緻蠶絲低防敏 (特柔親膚)');
  const [newBaseMaterial, setNewBaseMaterial] = useState('double');
  const [newBaseMaterialLabel, setNewBaseMaterialLabel] = useState('雙層');
  const [newPriceType, setNewPriceType] = useState<'custom' | 'ready'>('custom');
  const [newTag, setNewTag] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBreathability, setNewBreathability] = useState(5);
  const [newDurability, setNewDurability] = useState(5);
  const [newNaturalness, setNewNaturalness] = useState(5);
  const [newGentleness, setNewGentleness] = useState(5);
  const [newFeatures, setNewFeatures] = useState('');
  const [newStylingTips, setNewStylingTips] = useState('');
  const [newBestFit, setNewBestFit] = useState('');
  const [newLifeSpan, setNewLifeSpan] = useState('18 - 24 個月');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/wigs');
      const data = await res.json();
      const chemoItems = data.filter((item: any) => item.type === 'chemo');
      if (chemoItems.length > 0) {
        setProducts(chemoItems);
      } else {
        setProducts(DEFAULT_CHEMO_PRODUCTS);
      }
    } catch (err) {
      console.error("Error fetching chemo wigs:", err);
      setProducts(DEFAULT_CHEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddWig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('權限不足：新增與管理款式型號僅限「超級使用者」操作！請先登入超級使用者身份。');
      if (onRequestLogin) onRequestLogin();
      return;
    }
    if (!newTitle.trim()) {
      alert('請輸入醫療/化療假髮款式編號或品名！');
      return;
    }
    if (!newCategoryLabel.trim()) {
      alert('請輸入醫療款式或大分類名稱！');
      return;
    }

    setSubmitting(true);
    try {
      const featureArray = newFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const computedCategory = newCategoryLabel.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');
      const computedMaterial = newBaseMaterialLabel.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');

      const resp = await fetch('/api/wigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chemo',
          title: newTitle,
          category: computedCategory || 'custom-category',
          categoryLabel: newCategoryLabel.trim(),
          baseMaterial: computedMaterial || 'custom-material',
          baseMaterialLabel: newBaseMaterialLabel.trim(),
          priceType: newPriceType,
          tag: newTag || '醫療特柔低敏',
          description: newDescription || '專為抗癌化療或落髮性頭皮設計，全手工遞針針針精織，仿生真毛囊外觀，輕柔透氣。',
          breathability: Number(newBreathability),
          durability: Number(newDurability),
          naturalness: Number(newNaturalness),
          gentleness: Number(newGentleness),
          features: featureArray.length > 0 ? featureArray : ['抗敏感無痕桑蠶絲親膚打底', '雙向微孔孔雀編排空氣流道', '100% 尊絕純淨 Remy 真髮絲'],
          stylingTips: newStylingTips || '洗頭時使用中性弱酸洗髮精，避免用力揉搓，平鋪陰乾。',
          bestFit: newBestFit || '面臨放射或化學治療引起的落髮者，及全頭禿或極度敏感頭皮人士。',
          lifeSpan: newLifeSpan
        })
      });

      if (resp.ok) {
        setNewTitle('');
        setNewTag('');
        setNewDescription('');
        setNewFeatures('');
        setNewStylingTips('');
        setNewBestFit('');
        setShowAddForm(false);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error saving chemo wig:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWig = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin && !isEditMode) {
      alert('權限不足：刪除與管理款式型號僅限「超級使用者」操作！請先登入超級使用者身份。');
      if (onRequestLogin) onRequestLogin();
      return;
    }
    if (!window.confirm('確定要刪除此醫療化療假髮型號嗎？將從系統中永久移除。')) return;

    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }

    try {
      const resp = await fetch(`/api/wigs/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!resp.ok) {
        console.error("Failed to delete chemo wig from backend, status:", resp.status);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting chemo wig:", err);
      await fetchProducts();
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const uniqueCategories = useMemo(() => {
    const cats = new Map<string, string>();
    cats.set('silk-comfort', '極緻蠶絲');
    cats.set('full-lace', '手工針織');
    cats.set('breathable-cap', '無痕排汗');

    products.forEach((p) => {
      if (p.category && p.categoryLabel) {
        const shortLabel = p.categoryLabel.split('(')[0].trim();
        cats.set(p.category, shortLabel);
      }
    });

    return Array.from(cats.entries()).map(([id, label]) => ({ id, label }));
  }, [products]);

  const getMaterialCategory = (baseMaterial: string, baseMaterialLabel: string): 'single' | 'double' | 'skin' => {
    const label = (baseMaterialLabel || '').toLowerCase();
    const mat = (baseMaterial || '').toLowerCase();
    if (label.includes('生物') || label.includes('仿生') || label.includes('skin') || label.includes('膜') || label.includes('hybrid') || label.includes('矽膠') || mat.includes('skin') || mat.includes('hybrid')) {
      return 'skin';
    }
    if (label.includes('雙層') || label.includes('double') || label.includes('蠶絲') || label.includes('silk') || mat.includes('silk') || mat.includes('double')) {
      return 'double';
    }
    return 'single';
  };

  const uniqueMaterials = useMemo(() => {
    return [
      { id: 'single', label: '單層' },
      { id: 'double', label: '雙層' },
      { id: 'skin', label: '生物膜' }
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const productCat = getMaterialCategory(product.baseMaterial, product.baseMaterialLabel);
      const matchMaterial = selectedMaterial === 'all' || productCat === selectedMaterial;
      const matchSearch = searchQuery.trim() === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchMaterial && matchSearch;
    });
  }, [products, selectedCategory, selectedMaterial, searchQuery]);

  return (
    <div className="bg-[#FAFDFB] min-h-screen pb-24 text-zinc-900 font-sans selection:bg-brand-500 selection:text-white relative">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 z-50 animate-pulse" />

      {/* Premium Header Hero */}
      <header className="bg-zinc-950 text-white relative py-20 overflow-hidden border-b border-brand-950/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-300 font-bold text-xs uppercase tracking-widest bg-zinc-900/80 hover:bg-zinc-900 px-4 py-2 rounded-xl mb-10 border border-zinc-800/80 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-400" />
            返回首頁 (Home)
          </button>

          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/25 text-xs font-black tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400 fill-brand-400 animate-pulse" />
              醫療低敏防護標準 ｜ 100% Remy 純淨真人健康髮絲
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <EditableText
                idKey="chemo-banner-title"
                defaultText="化療・醫療級低敏假髮專區"
                as="span"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              /> <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-brand-200 to-brand-400">
                <EditableText
                  idKey="chemo-banner-subtitle"
                  defaultText="100% 純淨真髮・專為抗癌化療與脆弱頭皮打造的「零感透氣守護」"
                  as="span"
                  isAdmin={isAdmin}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={onSave || (() => {})}
                />
              </span>
            </h1>
            
            <EditableText
              idKey="chemo-banner-desc"
              defaultText="專為面臨化療落髮、放射治療、全頭禿、斑禿及高度脆弱頭皮人士特設。100% 採用純淨真人髮絲與天然桑蠶絲親膚材料，針針純手工精密勾織，無重力減壓設計，我們以極致同理心為您守護抗癌時光的溫柔自信。"
              as="p"
              className="text-zinc-300 font-light text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl"
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={onSave || (() => {})}
            />

            {/* Quick Badges */}
            <div className="pt-2 flex flex-wrap gap-3 text-xs text-zinc-300">
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-400" /> 100% 頂級真髮，可自由修剪吹整
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-400" /> 物理低敏感桑蠶絲，極致親膚零刺激
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-400" /> 1 對 1 獨立 VIP 包廂隱密諮詢與陪伴
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Single Before/After Showcase Frame for Chemo / Medical */}
        <section id="chemo-before-after-showcase" className="mb-20">
          <div className="bg-white rounded-[2.5rem] border border-brand-100/80 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
            
            {/* Showcase Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20 text-xs font-black tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                Medical Transformation Case
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                醫療化療假髮・真人改造前後對比 (Before & After)
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base font-normal leading-relaxed">
                溫柔守護抗癌時光的自信與美麗。採用 100% 純淨優級真髮與雙層微孔桑蠶絲底網，全頭手工微雕，360° 透氣服貼零壓迫。
              </p>
            </div>

            {/* Single Unified Before/After Photo with Directional Arrows */}
            <div className="mb-10">
              <div className="relative rounded-3xl overflow-hidden border-2 border-brand-100/90 shadow-2xl bg-zinc-950">
                
                {/* Directional Header Bar with 2 Animated Pointer Arrows */}
                <div className="grid grid-cols-2 bg-zinc-900 border-b border-zinc-800 text-white p-3.5 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-brand-300 font-black text-sm sm:text-base border-r border-zinc-700/80 pr-2">
                    <Sparkles className="w-4 h-4 text-brand-400 fill-brand-400" />
                    <span>改造後 (AFTER)</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white shadow-md">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-zinc-200 font-black text-sm sm:text-base pl-2">
                    <span className="w-3 h-3 rounded-full bg-zinc-400"></span>
                    <span>改造前 (BEFORE)</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 shadow-md">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>
                </div>

                {/* Unified Image Display Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/化療BeforeAfter.jpg" 
                    alt="醫療化療假髮・真人改造前後對比" 
                    className="w-full h-full object-contain bg-zinc-950"
                    referrerPolicy="no-referrer"
                  />

                  {/* Left Callout with Prominent Arrow Pointing Down to After Hair */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-brand-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl shadow-brand-600/40 border-2 border-brand-400 flex items-center gap-2.5 text-xs sm:text-sm font-black ring-2 ring-brand-500/30">
                    <Sparkles className="w-4 h-4 text-brand-200 fill-brand-200" />
                    <span>AFTER 改造後</span>
                    <div className="w-7 h-7 rounded-xl bg-zinc-950 text-brand-300 border border-brand-400 flex items-center justify-center shadow">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  {/* Right Callout with Prominent Arrow Pointing Down to Before Hair */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-zinc-950/95 backdrop-blur-md text-zinc-100 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border-2 border-zinc-600 shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-black ring-2 ring-black/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-ping" />
                    <span>BEFORE 改造前</span>
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-200 shadow">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-20 bg-zinc-950/90 backdrop-blur-md border border-brand-500/30 text-white rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                    <div className="text-xs sm:text-sm font-bold text-zinc-300 text-center sm:text-left">
                      <span className="text-brand-400 font-black">【病友實證蛻變】</span> 100% 純淨真髮 ‧ 物理低敏蠶絲 ‧ 360° 舒適透氣零壓迫
                    </div>
                    <a
                      href="https://line.me/R/ti/p/@davidhair"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      LINE 醫療專員諮詢
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* 4 Pillars Mini Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-brand-100 text-center">
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">100% 純淨真人真髮</span>
                <span className="text-[11px] text-zinc-600">柔順天然 ‧ 可吹整修剪</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">物理低敏桑蠶絲</span>
                <span className="text-[11px] text-zinc-600">無毒無膠 ‧ 敏弱頭皮首選</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">3D全透氣微孔內網</span>
                <span className="text-[11px] text-zinc-600">夏日排汗 ‧ 零悶熱無壓迫</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">醫療專屬 VIP 包廂</span>
                <span className="text-[11px] text-zinc-600">隱密試戴 ‧ 專人一對一修剪</span>
              </div>
            </div>

            {/* Additional Real Case Example */}
            <div className="mt-10 pt-8 border-t border-brand-100">
              <h3 className="text-center text-lg font-black text-zinc-800 mb-5">更多真實案例分享</h3>
              <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border border-brand-100/90 shadow-lg">
                <img loading="lazy" decoding="async"
                  src="/images/抗癌2.jpg"
                  alt="醫療化療假髮真實案例分享"
                  className="w-full h-auto object-contain bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 醫療假髮三大核心優勢 (The 3 Pillars of Medical Wig) */}
        <section className="mb-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <Sparkle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">100% 醫療級純淨真髮</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              保留完整毛鱗片排列，光澤柔和自然，垂墜感一流。可隨心吹整造型、依原本髮型微調修剪，毫無化纖假髮塑膠反光感。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">物理低敏桑蠶絲親膚內網</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              天然桑蠶絲接觸面，零化學膠水接觸，給予敏感脆弱頭皮如絲綢般的溫柔包覆，高透氣立體微孔讓頭皮隨時自在呼吸。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">1 對 1 獨立 VIP 包廂與全程陪伴</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              專屬隱密包廂，由資深造型師依臉型現場精修，陪伴您走過化療前期、落髮期到新髮生長全過程，安心有尊嚴。
            </p>
          </div>
        </section>

        {/* 化療假髮結構工藝說明 */}
        <section className="mb-20 bg-white rounded-[2.5rem] border border-brand-100/80 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="rounded-3xl overflow-hidden border border-brand-100/90 shadow-lg order-2 md:order-1">
              <img loading="lazy" decoding="async"
                src="/images/化療工具.jpg"
                alt="化療假髮親膚網帽結構說明"
                className="w-full h-auto object-contain bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-4 order-1 md:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20 text-xs font-black tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Cap Structure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                專為化療癌友設計的親膚網帽結構
              </h2>
              <ul className="space-y-3 text-sm text-zinc-600 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                  <span><strong className="text-zinc-900">親膚網帽：</strong>網帽材質通過 SGS 人體斑貼試驗，安心佩戴舒適無負擔。</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                  <span><strong className="text-zinc-900">全手織工藝：</strong>整頂手工鉤織，髮流自然、透氣不悶熱。</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                  <span><strong className="text-zinc-900">防滑矽膠設計：</strong>專為光頭設計，吸附頭皮更服貼自然。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 醫療假髮・尊榮五大客製服務流程 */}
        <section id="chemo-custom-process" className="mb-20 bg-zinc-950 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden border border-zinc-800 text-white">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14 space-y-4">
            <span className="inline-block bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Medical Care Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              醫療化療假髮・五大暖心照護流程
            </h2>
            <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed">
              從化療前原生髮型記錄、3D 頭型精準量模、純手工親膚勾織到現場沙龍精剪，提供全方位的專業與溫暖照護。
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: '療程前預約諮詢',
                desc: '化療開始前先記錄原本髮流與髮色，安排獨立 VIP 隱密包廂預先挑選。'
              },
              {
                step: '02',
                title: '3D頭型精準量模',
                desc: '針對頭骨弧度、頭圍尺寸與耳後弧線進行 1:1 精密量測，確保服貼不滑動。'
              },
              {
                step: '03',
                title: '純手工親膚勾織',
                desc: '採用 100% 純淨真髮與天然桑蠶絲底網，針針單針手工勾織，零壓迫感。'
              },
              {
                step: '04',
                title: '現場沙龍精剪銜接',
                desc: '資深造型師依臉型現場修剪瀏海、層次比例，完美復刻自然原生髮型。'
              },
              {
                step: '05',
                title: '全療程售後照護',
                desc: '提供清洗保養指導、落髮期微調調整，並享有一年內免費修剪與保固服務。'
              }
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center space-y-3 bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 group hover:bg-zinc-900 transition-all duration-300">
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white font-black flex items-center justify-center text-base shadow-lg shadow-brand-600/25">
                  {item.step}
                </div>
                <h3 className="font-extrabold text-base text-zinc-100">{item.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-brand-950 rounded-[2.5rem] p-8 sm:p-12 text-white text-center shadow-2xl relative overflow-hidden mb-12 border border-brand-900/30">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Private Medical Care
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">溫柔守護抗癌時光，找回自信優雅笑容</h3>
            <p className="text-zinc-300 font-light text-xs sm:text-sm leading-relaxed">
              大衛假髮全心呵護每位面對抗癌或落髮考驗的朋友。點擊下方按鈕加入官方 LINE 留言預約，由醫療假髮專員在獨立 VIP 包廂為您一對一量身試戴。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a 
                href="https://line.me/R/ti/p/@davidhair" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#06C755] hover:bg-[#05b34c] text-white px-8 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" /> 
                預約一對一私密包廂一小時免費諮詢
              </a>
              <button 
                onClick={onBack}
                className="bg-transparent hover:bg-white/10 text-white border border-zinc-700 px-8 py-4 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                返回官網首頁
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 overflow-hidden text-zinc-900"
            >
              <div className="h-4 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
              
              <div className="p-6 sm:p-10 space-y-6">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-brand-700 bg-brand-50 border border-brand-100 rounded px-2.5 py-1.5 uppercase inline-block mb-3">
                    {selectedProduct.categoryLabel} ｜ {selectedProduct.tag}
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 mb-2 leading-snug">
                    <EditableText
                      idKey={`wig-title-${selectedProduct.id}`}
                      defaultText={selectedProduct.title}
                      as="span"
                      isAdmin={isAdmin}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={onSave || (() => {})}
                    />
                  </h2>
                  <div className="text-zinc-700 text-sm sm:text-base leading-relaxed font-normal">
                    <EditableText
                      idKey={`wig-desc-${selectedProduct.id}`}
                      defaultText={selectedProduct.description}
                      as="span"
                      isAdmin={isAdmin}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={onSave || (() => {})}
                    />
                  </div>
                </div>

                {/* Main grid detailing specification and care details */}
                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase">內網貼膚底材種類</span>
                      <strong className="text-zinc-800 font-extrabold">{selectedProduct.baseMaterialLabel}</strong>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase">平均推薦耐用壽命</span>
                      <strong className="text-zinc-800 font-extrabold">{selectedProduct.lifeSpan}</strong>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase font-mono">產品工藝特色及製法</span>
                      <div className="space-y-1 mt-1">
                        {selectedProduct.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-zinc-650">
                            <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/50 space-y-3">
                      <span className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase">親膚級智能指針</span>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">極柔低敏感</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{(selectedProduct.gentleness || 5)}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${((selectedProduct.gentleness || 5) / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">排汗透氣度</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{selectedProduct.breathability}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(selectedProduct.breathability / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">逼真自然度</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{selectedProduct.naturalness}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(selectedProduct.naturalness / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4 border-t border-zinc-100">
                  <div>
                    <span className="block text-xs font-black text-brand-700 tracking-widest uppercase mb-1.5">對象客群最佳推薦</span>
                    <p className="text-sm text-zinc-700 leading-relaxed font-normal">{selectedProduct.bestFit}</p>
                  </div>

                  <div>
                    <span className="block text-xs font-black text-brand-700 tracking-widest uppercase mb-1.5">日常護理與清潔注意事項</span>
                    <p className="text-sm text-zinc-700 leading-relaxed font-normal">{selectedProduct.stylingTips}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  {(isAdmin || isEditMode) && (
                    <button
                      onClick={(e) => {
                        const targetId = selectedProduct.id;
                        handleDeleteWig(targetId, e);
                      }}
                      className="px-5 py-4 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      刪除此款
                    </button>
                  )}
                  <a
                    href="https://line.me/R/ti/p/@davidhair"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#06C755] hover:bg-[#05b34c] active:scale-95 text-white font-black text-xs py-4 rounded-xl shadow transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    LINE 預約抗癌醫療一對一樣模
                  </a>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-bold text-xs rounded-xl transition-all"
                  >
                    關閉
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

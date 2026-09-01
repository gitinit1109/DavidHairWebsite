import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Search, SlidersHorizontal, ArrowLeft, ArrowUpRight, ArrowDown, ArrowRight,
  CheckCircle2, Compass, Cpu, Landmark, Sparkles, ShowerHead, 
  Activity, Star, HelpCircle, MessageCircle, Calendar, ShieldCheck, 
  MapPin, Check, Ruler, Info, Clock, Plus, Minus, Lock,
  ChevronLeft, ChevronRight, Trash2, Loader2
} from 'lucide-react';
import { MensWigProduct } from '../types';
import EditableText from './EditableText';

// Raw mock data representing David's professional product lines
const MENS_WIG_PRODUCTS: MensWigProduct[] = [];
const DEPRECATED_MENS_PRODUCTS: any[] = [
  {
    id: 'mens-classic-executive',
    title: '「頂級單層網・經典商務款」 (Classic Executive Single Mesh)',
    category: 'hairline',
    categoryLabel: '髮際線款 (精準修飾)',
    baseMaterial: 'lace',
    baseMaterialLabel: '單層網',
    priceType: 'custom',
    tag: '前額無痕・精準髮際線',
    imgUrl: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=600&h=600',
    description: '專為著重前額與髮際線無痕過渡的型男設計。採用極致透氣的特供單層網底，髮流方向由職人純手工逐針針織，前額露出精確微雕髮際線，不分禿頂面積，大氣西裝頭首選。',
    breathability: 5,
    durability: 4,
    naturalness: 5,
    features: ['瑞士進口極薄無痕透氣網底', '精準微調原生毛髮旋向與髮流', '100% Remy 特優級真人髮絲', '前額可梳高，露出隱形微雕髮際線'],
    bestFit: '需要露出前額，展現自信、幹練、富有生活尊榮感的髮友。',
    stylingTips: '洗髮後用梳子在前心吹高定位，使用 Walker No-Shine 啞光隱形白膠貼牢，能完全露出前額且毫無痕跡。',
    lifeSpan: '10 - 12 個月'
  },
  {
    id: 'mens-korean-airy',
    title: '「韓系蓬鬆・微捲空氣感」 (K-Pop Volume Airy Wave)',
    category: 'natural',
    categoryLabel: '自然款 (高自然度、雙層網底)',
    baseMaterial: 'silk',
    baseMaterialLabel: '擬真蠶絲 (Silk Base)',
    priceType: 'ready',
    tag: '逼真雙層網・天然毛囊頭皮',
    imgUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=600&h=600',
    description: '當下最熱門的韓式空氣劉海與斜分微捲弧度。中心區使用雙層透氣蠶絲網底，帶有極高逼真度的手工針織毛囊陰影感，宛若頭皮天然生長出，蓬鬆百搭。',
    breathability: 4,
    durability: 5,
    naturalness: 5,
    features: ['雙層蠶絲高透真毛囊頭皮技術', '溫和輕度捲度烫針，隨時蓬鬆有型', '適合碎發劉海、中分/逗號劉海切換', '周邊細柔織邊，極高服貼防翹起'],
    bestFit: '多追求潮流髮型、不希望額頭露出的年輕落髮者與時尚髮友。',
    stylingTips: '吹乾時，可一邊用指腹推起髮根，一邊由下往上烘蓬。抹上極少許啞光髮乳或蓬蓬水，抓揉髮尾便可立體一整天。',
    lifeSpan: '12 - 18 個月'
  },
  {
    id: 'mens-ultra-skin',
    title: '「超薄隱形膜・無感極致款」 (Ultra-Thin Bio-Skin Second Gen)',
    category: 'hairline',
    categoryLabel: '髮際線款 (精準修飾)',
    baseMaterial: 'skin',
    baseMaterialLabel: '超薄PU生物膜 (Bio-Skin)',
    priceType: 'custom',
    tag: '0.03mm超薄膜・露出額油頭首選',
    imgUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=600',
    description: '厚度極薄至 0.03mm 的第二代親膚高耐用生物膜！與大腦頭皮厚度在物理層面完美貼合。前額進行了極其挑剔的「漸變短毛」羽化排勾，是追求大油頭、大背頭、敢於100%露額頭型男的究極之作。',
    breathability: 3,
    durability: 3,
    naturalness: 5,
    features: ['0.03mm 超薄羽量第二代高分子生物親膚膜', '360°露額無死角，大背頭、飛機頭皆能駕馭', '全無感真空貼合受重力，與肌膚同色同光', '純單針無結無痕勾發，宛若天生毛孔'],
    bestFit: '前額髮際線倒退、喜歡油頭西裝頭型男，且追求極致自然度與物理貼合感的品味男士。',
    stylingTips: '周邊推薦使用 Walker Max Hold 護膚底劑，前傾邊緣處用專業防水膠水刷塗一圈，用指腹壓實，完美防水且隨意梳高。',
    lifeSpan: '5 - 7 個月 (高消耗、極緻完美型)'
  },
  {
    id: 'mens-active-sport',
    title: '「極限運動・勁爽全透氣」 (Active Sport Extreme Ventilation)',
    category: 'basic',
    categoryLabel: '基本款 (入門首選、單層網底)',
    baseMaterial: 'lace',
    baseMaterialLabel: '單層網',
    priceType: 'custom',
    tag: '耐汗全透氣・單層網',
    imgUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=600',
    description: '特別針對酷愛激烈運動、容易大量流汗或重度戶外愛好者。選用進口強化單層微網底，具備最高級別的氣孔穿透速率。抗汗防水速乾能力一流。',
    breathability: 5,
    durability: 5,
    naturalness: 4,
    features: ['高張力高密度加固防撕裂編織微孔網底', '中高密頭髮覆蓋率，抗紫外線效果強', '耐水耐鹽分高規格處理特級真人髮絲', '清洗透氣效率比一般絹網高出 40%'],
    bestFit: '平時運動頻率高、重訓愛好者，或者是在外作業多、出汗量極大的髮友。',
    stylingTips: '四周全貼 Walker Ultra Hold 藍帶或者 Super Tape 強效拉力貼。每隔 1-2 週可以自行卸除，直接沖水速乾清洗。',
    lifeSpan: '10 - 15 個月'
  },
  {
    id: 'mens-modern-pompadour',
    title: '「氣質油頭・雙工藝尊榮款」 (Modern Pompadour Silk Touch)',
    category: 'natural',
    categoryLabel: '自然款 (高自然度、雙層網底)',
    baseMaterial: 'silk',
    baseMaterialLabel: '擬真蠶絲 (Silk Base)',
    priceType: 'custom',
    tag: '雙層絹網・物理擬真分線',
    imgUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600&h=600',
    description: '完美融合前額無痕微網與雙層蠶絲擬真網底。核心分線處極具立體毛囊陰影，分線自如，即使近距離仰視亦如同天生。',
    breathability: 4,
    durability: 4,
    naturalness: 5,
    features: ['前額 1.5cm 親膚瑞士隱影細網 + 頂部雙層絹蠶絲', '完美塑造復古斜分油頭、上揚大飛機頭', '毛囊陰影在精確側面觀察下依舊宛若實體', '可多次燙色、重剪定位，多變性極佳'],
    bestFit: '看重多樣穿戴自由度、常需要左右分線交替，同時又追求頂部立體蓬鬆度之輕熟型男。',
    stylingTips: '吹風時，用圓筒梳捲起核心區髮根向斜後方頂風。搭配沾取指尖大小高黏度霧面塑形蠟，往上翻折整理出線條感。',
    lifeSpan: '12 - 16 個月'
  },
  {
    id: 'mens-daily-casual',
    title: '「經典日常首選・好整理高CP值」 (Daily Casual High-Value)',
    category: 'basic',
    categoryLabel: '基本款 (入門首選、單層網底)',
    baseMaterial: 'silk',
    baseMaterialLabel: '擬真蠶絲 (Silk Base)',
    priceType: 'ready',
    tag: '極易貼膠除膠・新手神器',
    imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=600',
    description: '大衛大哥誠意力薦的入門首款！中心區採用透氣網底，周邊拼配一圈極易清洗除膠的單層柔軟PU跑道邊，大大省除初學者保養時間。',
    breathability: 4,
    durability: 5,
    naturalness: 4,
    features: ['周邊 PU 跑道型定點包邊，方便超速貼膠除膠', '頂部天然舒柔透氣蠶絲底網，減少頭皮敏感性', '版型不挑臉型，休閒碎剪百搭自然', '新手友好的全方位神級高性價比入門款'],
    bestFit: '第一頂假髮入門者、想要自己在家動手快速清膠與保養的，高性價比優先考慮 the target 髮友。',
    stylingTips: '因為有四周 PU 包邊，可以直接塗抹 Walker C-22 除膠劑噴灑，停留一分鐘一擦即淨。日常只需用大木梳由後往前梳順，極省力。',
    lifeSpan: '12 - 18 個月'
  }
];

interface MensWigCatalogProps {
  onBack: () => void;
  isAdmin?: boolean;
  onRequestLogin?: () => void;
  isEditMode?: boolean;
  siteContent?: Record<string, string>;
  onSave?: (key: string, val: string) => void;
}

export default function MensWigCatalog({ 
  onBack, 
  isAdmin = false, 
  onRequestLogin,
  isEditMode = false,
  siteContent = {},
  onSave
}: MensWigCatalogProps) {
  const [products, setProducts] = useState<MensWigProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('耐用款');
  const [newBaseMaterial, setNewBaseMaterial] = useState('single');
  const [newBaseMaterialLabel, setNewBaseMaterialLabel] = useState('單層');
  const [newPriceType, setNewPriceType] = useState<'custom' | 'ready'>('custom');
  const [newTag, setNewTag] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBreathability, setNewBreathability] = useState(5);
  const [newDurability, setNewDurability] = useState(5);
  const [newNaturalness, setNewNaturalness] = useState(5);
  const [newFeatures, setNewFeatures] = useState('');
  const [newStylingTips, setNewStylingTips] = useState('');
  const [newBestFit, setNewBestFit] = useState('');
  const [newLifeSpan, setNewLifeSpan] = useState('12 - 18 個月');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/wigs');
      const data = await res.json();
      setProducts(data.filter((item: any) => item.type === 'mens'));
    } catch (err) {
      console.error("Error fetching mens wigs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddWig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin && !isEditMode) {
      alert('權限不足：新增與管理款式型號僅限「超級使用者」操作！請先登入超級使用者身份。');
      if (onRequestLogin) onRequestLogin();
      return;
    }
    if (!newTitle.trim()) {
      alert('請輸入男士假髮款式編號或品名！');
      return;
    }
    if (!newCategoryLabel.trim()) {
      alert('請輸入款式大分類名稱！');
      return;
    }

    setSubmitting(true);
    try {
      const featureArray = newFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      // Compute dynamic category slug from user-typed label
      const computedCategory = newCategoryLabel.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');
      // Compute dynamic material slug from user-typed label
      const computedMaterial = newBaseMaterialLabel.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');

      const resp = await fetch('/api/wigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mens',
          title: newTitle,
          category: computedCategory || 'custom-category',
          categoryLabel: newCategoryLabel.trim(),
          baseMaterial: computedMaterial || 'custom-material',
          baseMaterialLabel: newBaseMaterialLabel.trim(),
          priceType: newPriceType,
          tag: newTag || '極致擬真手織髮',
          description: newDescription || '專為男士量身剪裁，極薄邊界無感貼合，物理透氣度極佳。',
          breathability: Number(newBreathability),
          durability: Number(newDurability),
          naturalness: Number(newNaturalness),
          features: featureArray.length > 0 ? featureArray : ['1.5cm 薄邊生物隱形貼邊工藝', '3D 抗扁塌高立體感髮流', '100% 尊享極柔真人髮絲'],
          stylingTips: newStylingTips || '洗完後順向吹，使用少許霧面髮蠟抓出層次即可。',
          bestFit: newBestFit || '面臨前額 M 字後退、頭頂髮量稀疏或需要整體蓬鬆感的型男。',
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
      console.error("Error saving mens wig:", err);
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
    if (!window.confirm('確定要刪除此男士客製化假髮型號嗎？將從系統中永久移除。')) return;

    // Optimistically update local state
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }

    try {
      const resp = await fetch(`/api/wigs/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!resp.ok) {
        console.error("Failed to delete mens wig from backend, status:", resp.status);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting mens wig:", err);
      await fetchProducts();
    }
  };

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const materialScrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically extract all available categories, keeping the default ones
  const uniqueCategories = useMemo(() => {
    const cats = new Map<string, string>();
    cats.set('durable', '耐用款');
    cats.set('skin', '生物膜款');
    cats.set('lace', '蕾絲款');

    products.forEach((p) => {
      if (p.category && p.categoryLabel) {
        cats.set(p.category, p.categoryLabel);
      }
    });

    return Array.from(cats.entries()).map(([id, label]) => ({ id, label }));
  }, [products]);

  // Help categorize materials
  const getMaterialCategory = (baseMaterial: string, baseMaterialLabel: string): 'single' | 'double' | 'skin' => {
    const label = (baseMaterialLabel || '').toLowerCase();
    const mat = (baseMaterial || '').toLowerCase();
    if (label.includes('生物') || label.includes('仿生') || label.includes('skin') || label.includes('膜') || label.includes('hybrid') || label.includes('矽膠') || mat.includes('skin') || mat.includes('hybrid')) {
      return 'skin'; // 生物膜
    }
    if (label.includes('雙層') || label.includes('double') || label.includes('蠶絲') || label.includes('silk') || mat.includes('silk') || mat.includes('double')) {
      return 'double'; // 雙層
    }
    return 'single'; // Default to 單層
  };

  // Dynamically extract all available materials, keeping the default ones
  const uniqueMaterials = useMemo(() => {
    return [
      { id: 'single', label: '單層' },
      { id: 'double', label: '雙層' },
      { id: 'skin', label: '生物膜' }
    ];
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<MensWigProduct | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const productCat = getMaterialCategory(product.baseMaterial, product.baseMaterialLabel);
      const matchesMaterial = selectedMaterial === 'all' || productCat === selectedMaterial;
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesMaterial && matchesSearch;
    });
  }, [products, selectedCategory, selectedMaterial, searchQuery]);

  // Handle auto LINE link generator
  const getLineLink = (productTitle: string) => {
    const text = `您好！我在 David哥假髮男士列表頁看中了這款：\n【${productTitle}】\n想預約實體店面諮詢並現場試戴，謝謝！`;
    return `https://line.me/R/ti/p/@davidhair?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="mens-catalog-root" className="min-h-screen bg-brand-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 z-50 animate-pulse" />

      <div className="max-w-7xl mx-auto mt-16 relative">
        
        {/* Back navigation & page title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-10 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Men's Bespoke Collection</span>
          </div>
        </div>

        {/* Hero Section Banner */}
        <div className="relative rounded-[2.5rem] bg-zinc-950 text-white overflow-hidden p-8 sm:p-12 lg:p-16 mb-16 shadow-2xl border-2 border-brand-500/20 group">
          {/* Hero Banner Background Image with elegant overlay gradient */}
          <div className="absolute inset-0 select-none pointer-events-none z-0">
            <img loading="lazy" decoding="async" 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1600&h=900" 
              alt="Premium Men's Grooming and Hairpiece Banner" 
              className="w-full h-full object-cover object-[center_22%] filter duration-[4000ms] ease-out brightness-[0.24] contrast-[1.05] scale-102 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Multi-layered cinematic gradient overlays for perfect text readability and depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.22),transparent_65%)]" />
            {/* Subtle light lines grid for technical, premium feel */}
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 text-xs font-black tracking-widest uppercase mb-6">
              <Sparkles className="w-4 h-4 fill-brand-400 text-brand-400 animate-pulse" />
              100% 真人髮絲客製 ｜ 大衛哥專業代理
            </div>
            
            {/* Professional Slogan Section */}
            <div className="mb-4">
              <span className="text-brand-400 font-extrabold text-sm sm:text-base tracking-widest block uppercase mb-1">
                — 極致無痕・自信重生 —
              </span>
              <EditableText
                idKey="mens-banner-quote"
                defaultText="「不只是假髮，更是您原本就擁有的精緻與尊榮氣場。」"
                as="p"
                className="text-xl sm:text-2xl font-serif italic text-zinc-100 font-medium tracking-wide"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-300">
              <EditableText
                idKey="mens-banner-title"
                defaultText="頂級男士假髮專區"
                as="span"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              />
            </h1>
            
            <EditableText
              idKey="mens-banner-desc"
              defaultText="大衛哥親自嚴選與專業開發。我們深知落髮帶來的焦慮。這項微雕工藝能在室外強光、近距離相處下，依然呈現宛若天生的髮旋與精確髮際線。我們拒絕虛高溢價，以名店 1/2 的良心價回饋每位有品味的髮友！"
              as="p"
              className="text-zinc-300 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl"
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={onSave || (() => {})}
            />
            
            <div className="flex flex-wrap gap-4 items-center">
              <a 
                href="https://line.me/R/ti/p/@davidhair" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-black px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 text-base"
              >
                <MessageCircle className="w-5 h-5 fill-zinc-950" />
                預約一對一店內完全測模
              </a>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-semibold border-l-2 border-zinc-800 pl-4 py-1">
                <CheckCircle2 className="w-5 h-5 text-brand-500" />
                台北門市(隱密式一對一包廂) ｜ 台中門市(隱密式一對一包廂) ｜ 高雄門市 (獨立透天訂製空間)
              </div>
            </div>
          </div>
        </div>



        {/* Single Before/After Showcase Frame */}
        <section id="mens-before-after-showcase" className="mb-20">
          <div className="bg-white rounded-[2.5rem] border border-zinc-200/90 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
            
            {/* Showcase Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20 text-xs font-black tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                Real Transformation Case
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                男士假髮・真人改造前後對比 (Before & After)
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base font-normal leading-relaxed">
                告別禿頂與髮際線後退的歲月痕跡。大衛哥嚴選 100% 特級 Remy 真人髮絲，純手工單根微雕，宛若天生髮旋毛囊，瞬間重現自信尊榮風範。
              </p>
            </div>

            {/* Single Unified Before/After Photo with Directional Arrows */}
            <div className="mb-10">
              <div className="relative rounded-3xl overflow-hidden border-2 border-zinc-200/90 shadow-2xl bg-zinc-950">
                
                {/* Directional Header Bar with 2 Animated Pointer Arrows */}
                <div className="grid grid-cols-2 bg-zinc-900 border-b border-zinc-800 text-white p-3.5 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-zinc-200 font-black text-sm sm:text-base border-r border-zinc-700/80 pr-2">
                    <span className="w-3 h-3 rounded-full bg-zinc-400"></span>
                    <span>改造前 (BEFORE)</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 shadow-md">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-brand-300 font-black text-sm sm:text-base pl-2">
                    <Sparkles className="w-4 h-4 text-brand-400 fill-brand-400" />
                    <span>改造後 (AFTER)</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-zinc-950 shadow-md">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>
                </div>

                {/* Unified Image Display Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/男生BeforeAfter.jpg" 
                    alt="男士假髮・真人改造前後對比 (Before & After)" 
                    className="w-full h-full object-contain bg-zinc-950"
                    referrerPolicy="no-referrer"
                  />

                  {/* Left Callout with Prominent Arrow Pointing Down to Before Hair */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-zinc-950/95 backdrop-blur-md text-zinc-100 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border-2 border-zinc-600 shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-black ring-2 ring-black/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-ping" />
                    <span>BEFORE 改造前</span>
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-200 shadow">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  {/* Right Callout with Prominent Arrow Pointing Down to After Hair */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-brand-500 text-zinc-950 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl shadow-brand-500/40 border-2 border-brand-300 flex items-center gap-2.5 text-xs sm:text-sm font-black ring-2 ring-brand-500/30">
                    <span>AFTER 改造後</span>
                    <div className="w-7 h-7 rounded-xl bg-zinc-950 text-brand-300 border border-brand-400 flex items-center justify-center shadow">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-20 bg-zinc-950/90 backdrop-blur-md border border-brand-500/30 text-white rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                    <div className="text-xs sm:text-sm font-bold text-zinc-300 text-center sm:text-left">
                      <span className="text-brand-400 font-black">【大衛哥真人實證】</span> 100% Remy 特級真髮 ‧ 宛若天生髮旋毛囊 ‧ 360° 透氣隱形微雕
                    </div>
                    <a
                      href="https://line.me/R/ti/p/@davidhair"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      LINE 免費評估
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* 4 Pillars Mini Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-100 text-center">
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <span className="block text-xs font-black text-zinc-900">100% Remy 少女真髮</span>
                <span className="text-[11px] text-zinc-500">毛鱗片順滑不糾結</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <span className="block text-xs font-black text-zinc-900">超薄透氣雙層底網</span>
                <span className="text-[11px] text-zinc-500">全日透氣清爽不悶熱</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <span className="block text-xs font-black text-zinc-900">3秒微夾 / 醫療防敏膠</span>
                <span className="text-[11px] text-zinc-500">多種配戴方式隨心選</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                <span className="block text-xs font-black text-zinc-900">1對1 獨立 VIP 包廂</span>
                <span className="text-[11px] text-zinc-500">隱密試戴 ‧ 售後一年保固</span>
              </div>
            </div>

          </div>
        </section>

        {/* 網底配戴與固定方式規格 */}
        <section id="attachment-methods" className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-zinc-200/80 mb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20 text-xs font-black tracking-wider uppercase">
                <Cpu className="w-4 h-4 text-brand-500" />
                Fixing Technology
              </span>
              <h3 className="font-black text-3xl text-zinc-900 tracking-tight leading-tight">
                客製網底固定與配戴規格
              </h3>
              <p className="text-zinc-750 font-normal leading-relaxed text-base">
                每位髮友的日常活動量與原生髮留存度均不相同，大衛哥為您客製專屬的固定方式。不論是極速穿脫、還是高強度極限運動，皆可完美適配。
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-md">A</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900">夾扣固定 (不需剃髮)</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed mt-1 font-normal">適合頭頂兩側仍有健康原生髮、不願剃除原生髮的髮友，使用專用親膚不鏽鋼夾扣定點扣合，極速穿脫，無多餘耗材。</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-md">B</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900">前黏後夾 (兼顧髮際線與便利性)</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed mt-1 font-normal">前額使用髮片專用膠帶，呈現完美的無痕微雕髮際線；後方與兩側使用定點夾扣鎖定。</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-md">C</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900">全黏貼固定 (24小時極致舒適)</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed mt-1 font-normal">專為重度運動愛好者設計。四周全面塗抹專用醫學親膚防水防汗膠，或強力無痕膠帶。洗頭、游泳、睡覺、高強度重訓均能紋絲不動。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 bg-zinc-50 p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 flex items-center justify-center shadow-inner">
              <img loading="lazy" decoding="async" 
                src="/images/11.jpg" 
                alt="大衛哥客製假髮網底配戴固定技術規格" 
                className="w-full h-auto rounded-2xl shadow-lg object-contain bg-white border border-zinc-200/70 p-2 sm:p-4 hover:scale-[1.01] transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* 為什麼選擇我們 (Why Choose Us) */}
        <section id="why-choose-us" className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20 text-xs font-black tracking-wider uppercase">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight liquid-glass-heading inline-block">
              <EditableText
                idKey="mens-why-title"
                defaultText="為什麼髮友一致推薦「大衛健康科技假髮」？"
                as="span"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              />
            </h2>
            <EditableText
              idKey="mens-why-desc"
              defaultText="拒絕暴利、拒絕推銷，我們以職人精神量身微雕。從材質源頭到終修剪，每一步都為您的完美形象把關。"
              as="p"
              className="text-zinc-500 font-light text-sm leading-relaxed"
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={onSave || (() => {})}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 liquid-glass-panel">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-zinc-950 transition-colors duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-900 mb-2">100% 特優級真人髮絲</h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-normal">
                嚴選未經化學受損的優良真人滑順健康髮，毛鱗片方向一致，觸感極為柔順自然、不易糾結，可任意染、燙、吹風造型。
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 liquid-glass-panel">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-zinc-950 transition-colors duration-300">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-900 mb-2">大衛哥專業頭模客製</h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-normal">
                由最專業卓越的美髮造型設計師團隊現場量身精剪、多層次漸變調校，打造宛若天生的自然分線。
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 liquid-glass-panel">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-zinc-950 transition-colors duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-900 mb-2">獨立隱私 VIP 包廂服務</h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-normal">
                全店採完全預約制。洗髮、打模、配戴和剃髮過程都在私密、高品質的單人隔間進行。全程隱密，絕不洩漏個人隱私，讓您尊榮無壓力。
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 liquid-glass-panel">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-zinc-950 transition-colors duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-900 mb-2">透明價格與品質保固</h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-normal">
                所有產品價格、底網規格完全公開透明，保障不加價。凡出廠假髮皆享有一年內免費補一次髮量服務。
              </p>
            </div>
          </div>
        </section>

        {/* 訂製與服務流程 (Customization & Service Process) */}
        <section id="service-process" className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-zinc-900 mb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-black tracking-wider uppercase">
              Craftsmanship Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white liquid-glass-heading-dark inline-block">
              職人客製假髮・五大黃金服務流程
            </h2>
            <p className="text-zinc-400 font-light text-sm leading-relaxed">
              全手工打造，匠心獨運。從初步頭皮檢測，到最終吹整，讓您體驗改頭換面、完美蛻變的心動過程。
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-5 gap-8">
            {[
              {
                step: '01',
                title: '線上諮詢與預約',
                desc: '加入 LINE (@davidhair)，告知您期望的髮型、落髮面積或煩惱，發送生活照，與大衛哥預約線下一對一尊榮面見。'
              },
              {
                step: '02',
                title: '頭型精確測量',
                desc: '親臨門市，於獨立隱密包廂，使用手工量制頭模。'
              },
              {
                step: '03',
                title: '純手工針製精製',
                desc: '資料送至核心織髮室，由多年熟練職人純手工在超薄微孔網上「逐針」按照生長規律排勾編織。'
              },
              {
                step: '04',
                title: '專業設計師精緻精修',
                desc: '安排店內的專業優質設計師直接為您提供「專屬修剪服務」，讓假髮邊緣與原生髮天衣無縫銜接。'
              },
              {
                step: '05',
                title: '專屬售後服務',
                desc: '配戴完成！教學您 30秒除膠與日常簡單洗滌訣竅，凡出廠假髮皆享有一年內免費補一次髮量服務。'
              }
            ].map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center space-y-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 group hover:bg-zinc-900 transition-all duration-300">
                {/* Visual Connector Line for Desktop */}
                {index < 4 && (
                  <div className="hidden md:block absolute top-[28%] -right-4 w-8 border-t border-dashed border-zinc-800 z-0 group-hover:border-brand-500 transition-colors" />
                )}
                
                <div className="w-12 h-12 rounded-full bg-brand-500 text-zinc-950 font-black flex items-center justify-center text-lg shadow-lg shadow-brand-500/20">
                  {item.step}
                </div>
                <h3 className="font-extrabold text-base text-zinc-100">{item.title}</h3>
                <p className="text-zinc-350 text-sm leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <div className="bg-brand-500 rounded-[2.5rem] p-8 sm:p-12 text-zinc-950 text-center shadow-2xl relative overflow-hidden mb-12 border-2 border-white/40">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">有頂上問題？直接加 LINE 即刻解決</h3>
            <p className="text-lg text-zinc-950/80 font-semibold leading-relaxed">
              假髮水很深，我們真心對待每位髮友。我們採全預約制一對一客製化專人服務能為您解答所有困擾。
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a 
                href="https://line.me/R/ti/p/@davidhair" 
                target="_blank" 
                with-id="line-foot-cat-link"
                className="bg-zinc-950 text-white font-extrabold px-10 py-5 rounded-2xl text-xl hover:bg-zinc-900 shadow-xl transition-all hover:-translate-y-1"
              >
                加 David哥 LINE (@davidhair)
              </a>
              <button 
                onClick={onBack}
                className="bg-white/80 hover:bg-white text-zinc-900 border border-zinc-200 font-extrabold px-10 py-5 rounded-2xl text-xl transition-all hover:-translate-y-1"
              >
                返回首頁查看門市
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Detail Showcase Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/45 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Modal outer tap-dismiss */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedProduct(null)} />
            
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-zinc-900 hover:bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                &times;
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
                
                {/* Hero header in modal with split */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start pb-6 border-b border-zinc-100">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 flex items-center justify-center shrink-0 border border-brand-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    <Sparkles className="w-10 h-10 text-brand-500 animate-pulse" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="inline-block bg-brand-500 text-zinc-950 font-black px-3 py-1 rounded-md text-[10px] uppercase tracking-wider mb-2">
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
                    <p className="text-zinc-600 font-bold text-sm">
                      底網工藝科技：<span className="text-brand-600 font-extrabold">{selectedProduct.baseMaterialLabel}</span>
                    </p>
                  </div>
                </div>

                {/* Main Desc */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider border-l-4 border-brand-500 pl-3">款式描述 (Description)</h4>
                  <p className="text-zinc-700 font-normal text-base leading-relaxed pl-1">
                    <EditableText
                      idKey={`wig-desc-${selectedProduct.id}`}
                      defaultText={selectedProduct.description}
                      as="span"
                      isAdmin={isAdmin}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={onSave || (() => {})}
                    />
                  </p>
                </div>

                {/* Key specs grid */}
                <div className="grid sm:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                      物理性能指標
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 font-bold">自然吻合度：</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < selectedProduct.naturalness ? 'fill-brand-500 text-brand-500' : 'text-zinc-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 font-bold">網面透氣度：</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < selectedProduct.breathability ? 'fill-brand-500 text-brand-500' : 'text-zinc-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 font-bold">底層耐磨耐撕度：</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < selectedProduct.durability ? 'fill-brand-500 text-brand-500' : 'text-zinc-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-brand-500" />
                      訂製維度規範
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 font-bold">預約類型：</span>
                        <span className="text-zinc-900 font-black">{selectedProduct.priceType === 'custom' ? '高級精細量模訂製' : '熱門型號現貨 / 精修剪配調'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 font-bold">預估使用壽命壽：</span>
                        <span className="text-zinc-900 font-black">{selectedProduct.lifeSpan}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features bulletins */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider border-l-4 border-brand-500 pl-3">
                    精細工藝亮點 (Craftsmanship Highlights)
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-3 pl-1">
                    {selectedProduct.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-600 text-sm font-semibold">
                        <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Styling Guide Advice */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider border-l-4 border-brand-500 pl-3">
                    日常吹整與保養 (Styling & Washing Tips)
                  </h4>
                  <p className="text-zinc-700 font-normal text-sm sm:text-base leading-relaxed p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                    大衛哥貼心指導：{selectedProduct.stylingTips}
                  </p>
                </div>

                {/* Recommended audience */}
                <div className="space-y-3 border-t border-zinc-100 pt-6">
                  <span className="text-zinc-650 text-sm font-bold block uppercase tracking-wider">最佳適配脫髮人群 (Ideally Best Fit)：</span>
                  <p className="text-zinc-850 font-black text-base">{selectedProduct.bestFit}</p>
                </div>

              </div>

              {/* Modal footer action */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                {(isAdmin || isEditMode) && (
                  <button 
                    onClick={(e) => {
                      const targetId = selectedProduct.id;
                      handleDeleteWig(targetId, e);
                    }}
                    className="px-5 py-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    刪除此款
                  </button>
                )}
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-3 rounded-xl bg-zinc-200 text-zinc-700 text-sm font-bold hover:bg-zinc-300 transition-colors"
                >
                  關閉
                </button>
                <a 
                  href={getLineLink(selectedProduct.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 text-sm font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/15"
                >
                  <MessageCircle className="w-5 h-5 text-zinc-950 fill-zinc-950" />
                  預約店內戴這款
                </a>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

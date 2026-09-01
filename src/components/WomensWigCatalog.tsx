import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Search, SlidersHorizontal, ArrowLeft, ArrowUpRight, ArrowDown,
  CheckCircle2, Sparkles, Activity, Star, MessageCircle, 
  Check, Ruler, Clock, Plus, Lock, Heart, Smile,
  ChevronLeft, ChevronRight, Trash2, Loader2, Feather, ShieldCheck,
  Sparkle, Layers, Cpu
} from 'lucide-react';
import { WomensWigProduct } from '../types';
import EditableText from './EditableText';

// Standard default women wig products
const DEFAULT_WOMENS_PRODUCTS: WomensWigProduct[] = [
  {
    id: 'womens-topper-silk-base',
    title: '「頂部局部微增髮片」',
    category: 'topper',
    categoryLabel: '頂部局部微髮片',
    baseMaterial: 'silk-net',
    baseMaterialLabel: '雙層網底',
    priceType: 'custom',
    tag: '頂部局部微增・3秒快扣',
    description: '專為解決女性頭頂扁塌、分線漸寬、頂部白髮及產後掉髮設計。採用高透氣立體雙層網底，純手工逐針單根勾織 100% 優質真人少女健康髮，與原生髮天衣無縫自然揉合，一扣秒變蓬鬆高顱頂。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '100% 特優級少女健康真髮，毛鱗片順滑不糾結',
      '專利微型親膚防滑夾扣，3 秒快穿、絕不扯原生髮',
      '雙層網底，近距離呈現天然毛囊頭皮血色感',
      '極輕透氣、全日佩戴無悶熱負擔'
    ],
    stylingTips: '可隨心電棒捲燙、吹風機吹整分線，洗後順著毛流吹乾即可維持豐盈立體度。',
    bestFit: '頭頂分線漸寬、產後或更年期頭頂稀疏、有白髮覆蓋需求、追求自然高顱頂的女性。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'womens-topper-french-bangs',
    title: '「頂部微增髮片」韓系減齡空氣法式瀏海髮片 (French Airy Bangs Topper)',
    category: 'topper',
    categoryLabel: '頂部局部微髮片',
    baseMaterial: 'mono-net',
    baseMaterialLabel: '超細舒敏單絲網 (Mono-Net)',
    priceType: 'ready',
    tag: '減齡修顏・法式空氣瀏海',
    description: '結合頭頂自然微增與韓系法式空氣瀏海。兩側羽化胎毛碎髮能完美修飾高顴骨、高額頭與 M 型髮際線，讓視覺年齡瞬間減齡 5-10 歲。',
    breathability: 5,
    durability: 4,
    naturalness: 5,
    features: [
      '100% 真人髮絲，可依個人臉型自由微調瀏海長度與弧度',
      '3D 弧形立體起拱底網，服貼前額頭骨不滑動',
      '超薄無感邊緣排勾，微風吹拂亦不露破綻',
      '免去頻繁修剪瀏海與化學染燙造成原生髮受損'
    ],
    stylingTips: '日常使用圓滾梳微帶 C 字弧度吹整，即可展現輕盈空氣感。',
    bestFit: '前額髮際線後退、額頭偏高、想嘗試瀏海又怕剪壞的原生髮女性。',
    lifeSpan: '12 - 18 個月'
  },
  {
    id: 'womens-ready-salon-bob',
    title: '「穿戴型假髮」經典沙龍日系俐落鮑伯短髮 (Classic Salon Bob Full Wig)',
    category: 'ready-to-wear',
    categoryLabel: '穿戴型真髮',
    baseMaterial: 'silk-net',
    baseMaterialLabel: '3D 仿真大髮旋真蠶絲底網',
    priceType: 'ready',
    tag: '經典日系・現貨即戴・修飾臉型',
    description: '立體內扣輪廓完美修飾臉型，頂部配置大面積仿真頭皮與手工大髮旋，可隨意切換旁分或中分。門市常備多款現貨，由專業髮型師現場修剪即可當日高雅帶走。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '100% 特優真人髮絲，光澤柔和自然，垂墜感極佳',
      '大面積 3D 仿真人工頭皮，俯視無死角如同原生生長',
      '全頭高彈性舒柔內網，附調節帶適應各種頭圍尺寸',
      '門市現貨 1 對 1 現場客製修剪，1 小時快速變身'
    ],
    stylingTips: '可使用平板夾在髮尾帶出俐落內扣或外翹造型，展現多變知性氣質。',
    bestFit: '希望快速變換短髮造型、全頭白髮不想頻繁染髮、或需短期出席重要場合的都會女性。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'womens-ready-collarbone-wave',
    title: '「穿戴型假髮」溫柔日韓鎖骨層次微捲髮 (Gentle Layered Collarbone Wave)',
    category: 'ready-to-wear',
    categoryLabel: '穿戴型真髮',
    baseMaterial: 'silk-net',
    baseMaterialLabel: '超輕透氣彈性蠶絲網',
    priceType: 'ready',
    tag: '黃金鎖骨線・溫柔減齡微捲',
    description: '長度落在迷人的鎖骨處，層次剪裁輕盈動感。嚴選優質真人髮絲，光澤柔和自然，配戴快速簡易，無論是放髮或隨意扎低馬尾都無比優雅。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '純手工排勾毛囊髮流，擺動極富彈性生命力',
      '親膚抗菌透氣內網，夏天配戴清爽不悶熱',
      '可耐 180 度高溫造型夾，任意變換捲度',
      '微型調節扣設計，牢固貼合不夾頭、不咬髮'
    ],
    stylingTips: '洗後抹上一滴護髮精油，用手輕抓髮尾微捲自然晾乾，即刻重現沙龍級光澤。',
    bestFit: '追求溫柔知性氣質、希望修飾肩頸與面部線條的精緻女性。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'womens-bespoke-3d-full',
    title: '「客製型假髮」3D 頭型微雕量身訂製全頂假髮 (Bespoke 3D Tailored Full Wig)',
    category: 'custom',
    categoryLabel: '客製型量身訂製',
    baseMaterial: 'biomimetic-skin',
    baseMaterialLabel: '極薄透氣仿生膜 + 雙層絹絲 (Hybrid Skin)',
    priceType: 'custom',
    tag: '1對1量模・30+髮色・運動不移位',
    description: '依據個人頭型、落髮邊界、骨相特徵進行 1:1 精密量模訂製。提供超過 30 種原生髮色精密對比，由資深職人一針一線勾織。服貼度如同第二層皮膚，劇烈運動、強風吹拂皆穩固安心。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '一對一精密量頭打模，完美貼合頭骨曲線',
      '100% 嚴選未燙染頂級少女原生真髮',
      '多種配戴方式可選（專利親膚微夾 / 醫療防敏感貼膠）',
      '享有完整的售後免費修剪調整與補髮保固'
    ],
    stylingTips: '完全比照自己的原生頭髮，可自由至沙龍洗髮、吹整、甚至挑染。',
    bestFit: '瀰漫性全頭落髮、追求極致無痕自然度與長期佩戴舒適性的女性。',
    lifeSpan: '24 - 36 個月'
  },
  {
    id: 'womens-bespoke-luxury-long',
    title: '「客製型假髮」奢華海藻長捲真髮 (Luxury Bespoke Mermaid Waves)',
    category: 'custom',
    categoryLabel: '客製型量身訂製',
    baseMaterial: 'silk-net',
    baseMaterialLabel: '雙層網底',
    priceType: 'custom',
    tag: '45cm+ 嚴選長髮・名媛氣場',
    description: '嚴選 45-50cm 超長優質少女真髮絲，波浪優雅垂墜，髮量豐沛有光澤。結合職人手勾頂部毛孔技術，分線自由切換，完美詮釋高貴優雅風範。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '45cm+ 頂級特長真髮，無雜質、無分岔',
      '360 度立體高透氣網底，長髮亦能快速散熱排汗',
      '可做半丸子頭、法式編髮、晚宴盤髮等多元造型',
      '一對一專屬女性獨立 VIP 包廂諮詢，私密安心'
    ],
    stylingTips: '洗滌後使用寬齒木梳由髮尾輕柔往上梳通，定期使用護髮素滋養。',
    bestFit: '喜愛飄逸長捲髮、需出席社交宴會或希望大幅增加長髮豐盈度的女性。',
    lifeSpan: '20 - 30 個月'
  },
  {
    id: 'womens-medical-silk-comfort',
    title: '「醫療級假髮」極柔防敏蠶絲全覆蓋醫療假髮 (Medical Grade Ultra-Soft Wig)',
    category: 'medical',
    categoryLabel: '醫療化療專用',
    baseMaterial: 'mono-net',
    baseMaterialLabel: '醫療舒敏雙層全蠶絲 (Medical Soft Silk)',
    priceType: 'custom',
    tag: '零金屬・抗菌親膚・醫療補助發票',
    description: '專為化療療程、自體免疫全禿等極度敏感脆弱頭皮設計。全頂內襯採用無縫超柔天然蠶絲與抗菌棉柔面料，全無金屬夾扣，杜絕摩擦刺激。提供一對一獨立包廂免費剃頭陪伴與醫療補助開立。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    features: [
      '100% 天然純淨真髮，超輕量減壓設計',
      '無金屬、無硬梗，躺臥睡眠不壓迫頭皮',
      '高透氣抑菌防臭底網，減緩頭皮出汗泛紅',
      '提供正式醫療發票與合格證明，協助申請醫療補助'
    ],
    stylingTips: '配戴前可先套上附贈的純棉吸汗髮帽，保護極致脆弱頭皮。',
    bestFit: '化療中、癌症康復期、斑禿全禿或頭皮容易敏感泛紅的女性。',
    lifeSpan: '18 - 24 個月'
  }
];

interface WomensWigCatalogProps {
  onBack: () => void;
  isAdmin?: boolean;
  onRequestLogin?: () => void;
  isEditMode?: boolean;
  siteContent?: Record<string, string>;
  onSave?: (key: string, val: string) => void;
}

export default function WomensWigCatalog({ 
  onBack, 
  isAdmin = false, 
  onRequestLogin,
  isEditMode = false,
  siteContent = {},
  onSave
}: WomensWigCatalogProps) {
  const [products, setProducts] = useState<WomensWigProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'topper' | 'ready-to-wear' | 'custom' | 'medical'>('topper');
  const [newCategoryLabel, setNewCategoryLabel] = useState('頂部局部微髮片');
  const [newBaseMaterial, setNewBaseMaterial] = useState('silk-net');
  const [newBaseMaterialLabel, setNewBaseMaterialLabel] = useState('雙層網底');
  const [newPriceType, setNewPriceType] = useState<'custom' | 'ready'>('custom');
  const [newTag, setNewTag] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBreathability, setNewBreathability] = useState(5);
  const [newDurability, setNewDurability] = useState(5);
  const [newNaturalness, setNewNaturalness] = useState(5);
  const [newFeatures, setNewFeatures] = useState('');
  const [newStylingTips, setNewStylingTips] = useState('');
  const [newBestFit, setNewBestFit] = useState('');
  const [newLifeSpan, setNewLifeSpan] = useState('18 - 24 個月');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/wigs');
      if (res.ok) {
        const data = await res.json();
        const womens = data.filter((item: any) => item.type === 'womens');
        setProducts(womens);
      }
    } catch (err) {
      console.error("Error fetching wigs:", err);
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
      alert('請輸入假髮款式編號或品名！');
      return;
    }

    setSubmitting(true);
    try {
      const featureArray = newFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const resp = await fetch('/api/wigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'womens',
          title: newTitle,
          category: newCategory,
          categoryLabel: newCategoryLabel.trim(),
          baseMaterial: newBaseMaterial,
          baseMaterialLabel: newBaseMaterialLabel.trim(),
          priceType: newPriceType,
          tag: newTag || '100% 真人手織髮',
          description: newDescription || '專為女性打造的頂級手工真髮與局部微增髮片，透氣如絲，自然服貼。',
          breathability: Number(newBreathability),
          durability: Number(newDurability),
          naturalness: Number(newNaturalness),
          features: featureArray.length > 0 ? featureArray : ['100% 特優少女健康真髮', '雙層網底透氣仿生頭皮', '微型親膚夾扣快拆防滑'],
          stylingTips: newStylingTips || '洗後順著毛流吹乾，可隨意使用電棒或吹風機做造型變換。',
          bestFit: newBestFit || '推薦面臨頭頂稀疏、分線漸寬、白髮覆蓋或追求立體高顱頂的女性。',
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
      console.error("Error saving wig:", err);
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
    if (!window.confirm('確定要刪除此客製假髮款式型號嗎？將從系統中永久移除。')) return;

    // Optimistically update local state
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }

    try {
      const resp = await fetch(`/api/wigs/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!resp.ok) {
        console.error("Failed to delete wig from backend, status:", resp.status);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting wig:", err);
      await fetchProducts();
    }
  };

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<WomensWigProduct | null>(null);

  // Standard Professional Categories
  const categoryFilters = [
    { id: 'all', label: '全部女性款式 (All)' },
    { id: 'topper', label: '頂部局部微髮片 (Toppers)' },
    { id: 'ready-to-wear', label: '穿戴型真髮 (Ready-to-Wear)' },
    { id: 'custom', label: '客製型量身訂製 (Bespoke)' },
    { id: 'medical', label: '醫療化療專用 (Medical Grade)' }
  ];

  // Materials categorization
  const getMaterialCategory = (baseMaterial: string, baseMaterialLabel: string): 'silk' | 'skin' | 'mono' => {
    const label = (baseMaterialLabel || '').toLowerCase();
    const mat = (baseMaterial || '').toLowerCase();
    if (label.includes('生物') || label.includes('仿生') || label.includes('skin') || label.includes('膜') || mat.includes('skin') || mat.includes('bio')) {
      return 'skin';
    }
    if (label.includes('單絲') || label.includes('mono') || mat.includes('mono')) {
      return 'mono';
    }
    return 'silk';
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const productMat = getMaterialCategory(product.baseMaterial, product.baseMaterialLabel);
      const matchMaterial = selectedMaterial === 'all' || productMat === selectedMaterial;
      const matchSearch = searchQuery.trim() === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchMaterial && matchSearch;
    });
  }, [products, selectedCategory, selectedMaterial, searchQuery]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24 text-zinc-900 font-sans selection:bg-brand-500 selection:text-white relative">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-300 to-brand-500 z-50 animate-pulse" />

      {/* Premium Header Hero */}
      <header className="bg-zinc-950 text-white relative py-20 overflow-hidden border-b border-brand-950/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        
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
              <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400 animate-pulse" />
              100% 真人少女髮絲
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <EditableText
                idKey="womens-banner-title"
                defaultText="高雅女士假髮與頂部微增髮片專區"
                as="span"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              /> <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-brand-400 to-amber-200">
                <EditableText
                  idKey="womens-banner-subtitle"
                  defaultText="真髮／科技絲髮・專為女性打造的「第二層皮膚」"
                  as="span"
                  isAdmin={isAdmin}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={onSave || (() => {})}
                />
              </span>
            </h1>
            
            <EditableText
              idKey="womens-banner-desc"
              defaultText="專為女性頭頂稀疏、分線漸寬、頭頂扁塌、白髮覆蓋、產後落髮及醫療需求設計。嚴選 100% 優質少女真髮，完美與原生髮無痕相融。"
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
                <Check className="w-3.5 h-3.5 text-brand-400" /> 100% 頂級真髮，可電棒捲燙染
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-400" /> 專利親膚微夾，3秒快扣不扯髮
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-400" /> 1 對 1 獨立 VIP 包廂隱密諮詢
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">        {/* Single Before/After Showcase Frame for Women */}
        <section id="womens-before-after-showcase" className="mb-20">
          <div className="bg-white rounded-[2.5rem] border border-brand-100/80 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
            
            {/* Showcase Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20 text-xs font-black tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                Women's Transformation Case
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                女士假髮・真人改造前後對比 (Before & After)
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base font-normal leading-relaxed">
                告別分線變寬、頭頂扁塌與產後/白髮煩惱。採用 100% 特級優質少女真髮與雙層網底，3 秒輕扣即刻擁有豐盈高顱頂與自信氣場。
              </p>
            </div>

            {/* Single Unified Before/After Photo with Directional Arrows */}
            <div className="mb-10">
              <div className="relative rounded-3xl overflow-hidden border-2 border-brand-100/90 shadow-2xl bg-zinc-950">
                
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
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white shadow-md">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>
                </div>

                {/* Unified Image Display Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/女生BeforeAfter.jpg" 
                    alt="女士假髮・真人改造前後對比 (Before & After)" 
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
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-brand-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl shadow-brand-600/40 border-2 border-brand-400 flex items-center gap-2.5 text-xs sm:text-sm font-black ring-2 ring-brand-500/30">
                    <span>AFTER 改造後</span>
                    <div className="w-7 h-7 rounded-xl bg-zinc-950 text-brand-300 border border-brand-400 flex items-center justify-center shadow">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-20 bg-zinc-950/90 backdrop-blur-md border border-brand-500/30 text-white rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                    <div className="text-xs sm:text-sm font-bold text-zinc-300 text-center sm:text-left">
                      <span className="text-brand-400 font-black">【真人實證蛻變】</span> 100% 少女真髮 ‧ 頂部雙層網底 ‧ 3秒無痕蓬鬆高顱頂
                    </div>
                    <a
                      href="https://line.me/R/ti/p/@davidhair"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      LINE 女性專員諮詢
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* 4 Pillars Mini Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-brand-100 text-center">
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">100% 少女真髮</span>
                <span className="text-[11px] text-zinc-600">柔順垂墜 ‧ 可吹整染燙</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">雙層網底工藝</span>
                <span className="text-[11px] text-zinc-600">真實毛囊 ‧ 輕薄透氣</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">專利親膚微型夾</span>
                <span className="text-[11px] text-zinc-600">3秒牢固快扣 ‧ 絕不拉扯</span>
              </div>
              <div className="p-3 bg-brand-50/40 rounded-2xl border border-brand-200/60">
                <span className="block text-xs font-black text-brand-950">女性專屬 VIP 包廂</span>
                <span className="text-[11px] text-zinc-600">隱密試戴 ‧ 售後一年保固</span>
              </div>
            </div>

            {/* Additional Real Case Example */}
            <div className="mt-10 pt-8 border-t border-brand-100">
              <h3 className="text-center text-lg font-black text-zinc-800 mb-5">更多真實案例分享</h3>
              <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border border-brand-100/90 shadow-lg">
                <img loading="lazy" decoding="async"
                  src="/images/女生2.jpg"
                  alt="女士假髮真實案例分享"
                  className="w-full h-auto object-contain bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 女士假髮三大核心優勢 (The 3 Pillars) */}
        <section className="mb-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <Sparkle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">100% 優質少女真髮</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              保留完整毛鱗片排列，光澤柔和自然，垂墜感一流。可隨心電棒捲燙、吹整造型甚至沙龍挑染，徹底告別化纖塑料反光。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">雙層網底工藝</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              高透氣立體雙層網底，模擬天然毛囊與頭皮血色感。近距離、微風吹起皆不露破綻，夏日配戴依然清爽。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-100/80 shadow-md flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">1 對 1 獨立 VIP 包廂修剪</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              專屬女性隱密包廂，由資深造型師依臉型、骨相現場精細修剪銜接，並享有完整售後一年免費保固與補髮服務。
            </p>
          </div>
        </section>

        {/* 女士假髮・尊榮五大客製流程 (Bespoke Process) */}
        <section id="womens-custom-process" className="mb-20 bg-zinc-950 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden border border-zinc-800 text-white">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14 space-y-4">
            <span className="inline-block bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Bespoke Craftsmanship
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              女士假髮・尊榮三大客製服務流程
            </h2>
            <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed">
              從一對一預約諮詢、現場試戴挑選到現場沙龍修剪，為您打造如天然生長的豐盈秀髮。
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: '線上預約諮詢',
                desc: '加 LINE 諮詢。現場1對1試戴服務。'
              },
              {
                step: '02',
                title: '現場沙龍精剪銜接',
                desc: '特約資深美髮設計師依臉型現場修剪瀏海、層次比例，與原生髮天衣無縫自然揉合。'
              },
              {
                step: '03',
                title: '售後尊榮保固服務',
                desc: '包含配戴洗護教學、專屬護理包，並享一年內免費修剪調整與補髮保固。'
              }
            ].map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center space-y-3 bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 group hover:bg-zinc-900 transition-all duration-300">
                <div className="w-11 h-11 rounded-full bg-brand-500 text-white font-black flex items-center justify-center text-base shadow-lg shadow-brand-500/25">
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
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Private Consultation
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-brand-400 to-amber-200">客製優雅不凡，找回柔亮自信秀髮</h3>
            <p className="text-zinc-300 font-light text-xs sm:text-sm leading-relaxed">
              大衛假髮全心呵護每位美麗精緻的女性。點擊下方按鈕加入官方 LINE 留言預約，由女性專員為您一對一量身試戴。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a 
                href="https://line.me/R/ti/p/@davidhair" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#06C755] hover:bg-[#05b34c] text-white px-8 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" /> 
                預約一對一免費諮詢
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
              className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 border border-zinc-200 flex flex-col max-h-[90vh]"
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-5 h-5 rotate-45" /> 
              </button>

              <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
                
                {/* Hero header in modal */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-zinc-100">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-950 flex items-center justify-center shrink-0 border border-brand-500/20 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="inline-block bg-brand-500 text-white font-black px-3 py-1 rounded-md text-[10px] uppercase tracking-wider mb-2">
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
                    <div className="text-zinc-650 font-normal text-sm leading-relaxed">
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
                </div>

                {/* Spec List */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <Cpu className="w-4 h-4 text-brand-500" />
                      底網與材質規格
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
                      <li className="flex justify-between">
                        <span>基礎底網：</span>
                        <strong className="text-zinc-900 font-bold">{selectedProduct.baseMaterialLabel}</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>髮絲來源：</span>
                        <strong className="text-zinc-900 font-bold">100% 特優少女真髮</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>預估壽命：</span>
                        <strong className="text-zinc-900 font-bold">{selectedProduct.lifeSpan}</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>尊榮保固：</span>
                        <strong className="text-brand-600 font-bold">享一年內免費補髮與調整</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <Ruler className="w-4 h-4 text-brand-500" />
                      工藝評分
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold text-zinc-600">
                          <span>舒適透氣度:</span>
                          <span className="font-mono text-zinc-900 font-extrabold">{selectedProduct.breathability}/5</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(selectedProduct.breathability / 5) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold text-zinc-600">
                          <span>仿真毛囊度:</span>
                          <span className="font-mono text-zinc-900 font-extrabold">{selectedProduct.naturalness}/5</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(selectedProduct.naturalness / 5) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key features checklist */}
                <div className="space-y-2.5 bg-brand-50/40 p-4 rounded-2xl border border-brand-100">
                  <h4 className="font-extrabold text-xs text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    產品核心特點 (Core Features)
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-zinc-800 pt-1">
                    {selectedProduct.features.map((feature, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expert advice and best fit */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <h5 className="font-extrabold text-brand-950 uppercase tracking-wider flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5 text-brand-500" />
                      適用對象 (Best Suited)
                    </h5>
                    <p className="text-zinc-650 leading-relaxed font-normal">{selectedProduct.bestFit}</p>
                  </div>
                  <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <h5 className="font-extrabold text-brand-950 uppercase tracking-wider flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-brand-500" />
                      吹整護理建議 (Styling Advice)
                    </h5>
                    <p className="text-zinc-650 leading-relaxed font-normal">{selectedProduct.stylingTips}</p>
                  </div>
                </div>

                {/* Modal CTA */}
                <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                  <a 
                    href="https://line.me/R/ti/p/@davidhair" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-[#06C755] hover:bg-[#05b34c] text-white py-3.5 rounded-xl text-center font-black text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" /> 
                    加 LINE 預約此款真人髮片獨立包廂體驗
                  </a>
                  {(isAdmin || isEditMode) && (
                    <button 
                      onClick={(e) => {
                        const targetId = selectedProduct.id;
                        handleDeleteWig(targetId, e);
                      }}
                      className="px-5 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-600 font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      刪除此款
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="sm:px-6 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
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

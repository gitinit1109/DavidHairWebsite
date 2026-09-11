import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowDown, CheckCircle2, Sparkles, MessageCircle, 
  Check, Clock, Plus, Heart, Smile,
  ChevronDown, Trash2, Loader2, ShieldCheck,
  Award, Droplets, Sun, Wind, HelpCircle,
  Eye, ZoomIn, Maximize2, X, Image as ImageIcon
} from 'lucide-react';
import { ChemoWigProduct } from '../types';
import EditableText from './EditableText';

// Standard medical grade default products referenced from high-standard medical wig specifications
const DEFAULT_CHEMO_PRODUCTS: ChemoWigProduct[] = [
  {
    id: 'chemo-bob-deluxe',
    title: '「俏麗清爽・經典鮑伯醫療全手織假髮」 (Medical Silk Classic Bob Wig)',
    category: 'short-bob',
    categoryLabel: '清爽短髮款',
    baseMaterial: 'double',
    baseMaterialLabel: '雙層防敏透氣醫療網底',
    priceType: 'custom',
    tag: '抗癌症首選・好洗易乾・0%壓迫感',
    imgUrl: '/images/抗癌2.jpg',
    description: '專為化療癌症病友精心設計的經典鮑伯短髮。長度落在下巴修飾雙頰，重心極輕巧，日常洗滌好吹乾、不易打結。全頂針針手工單針遞針精織，採用日本 JIS S 9623 規範之親膚低敏醫療網底，溫柔包覆脆弱頭皮，陪伴您優雅舒心度過抗癌療程。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '100% 物理低敏親膚醫療網打底，通過 SGS 低敏測試，告別紅癢刺痛',
      '純手工單針遞針精織，仿真頭皮與天然毛囊血色，近看零破綻',
      '100% 頂級純淨 Remy 少女真髮，自然柔順，可自由微調吹整修剪',
      '內建多段彈性微調伸縮帶，適應落髮至新髮生長 ±1.5cm 頭圍變化',
      '無金屬扣夾純親膚防滑矽膠設計，無髮頭皮溫柔自吸附不移位'
    ],
    stylingTips: '建議使用弱酸性溫和洗髮精平鋪以指腹順向輕壓清洗，毛巾吸乾後自然陰乾，輕輕梳理即現柔順鮑伯弧度。',
    bestFit: '即將或正在進行化療、放射治療、全頭落髮、白血球下降期或頭皮極度脆弱敏弱之女性。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'chemo-medium-wave',
    title: '「溫柔自然・及肩中長手織微捲假髮」 (Medical Silk Medium Wave Wig)',
    category: 'medium-length',
    categoryLabel: '及肩中長款',
    baseMaterial: 'double',
    baseMaterialLabel: '雙層防敏透氣醫療網底',
    priceType: 'custom',
    tag: '修飾臉型・自然垂墜・100%特優真髮',
    imgUrl: '/images/女生2.jpg',
    description: '及肩的柔美微彎長度，兼具優雅美感與日常好整理性。精選 100% 純淨少女真髮，毛鱗片順向排列，光澤柔和自然，垂墜感一流。全方位 3D 排汗微孔內網，夏季配戴依舊乾爽透氣，維持如原生秀髮般的自信好氣色。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '100% 特優級純淨少女真髮，保留天然毛鱗片，健康有彈性',
      '高透氣立體微孔散熱網帽，夏季散熱排汗快乾，告別悶熱汗斑',
      '仿真人工手織頭皮，分線可隨個人習慣自由切換中分或側分',
      '極致羽量化設計，整頂僅約 45g，長時間配戴無頭重感與頸椎壓力'
    ],
    stylingTips: '洗後使用圓梳吹整髮尾自然內彎弧度，亦可使用 140°C 以下電棒微調捲度。',
    bestFit: '喜愛中長髮、習慣職場或日常優雅柔美造型之化療病友與嚴重落髮朋友。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'chemo-elegant-long',
    title: '「知性優雅・氣質垂墜長直真髮假髮」 (Medical Silk Elegant Long Wig)',
    category: 'long-style',
    categoryLabel: '氣質長髮款',
    baseMaterial: 'double',
    baseMaterialLabel: '超輕量仿真人手織頭皮醫療網',
    priceType: 'custom',
    tag: '隨心綁紮・百變造型・可染燙吹整',
    imgUrl: '/images/catalog-women.jpg',
    description: '為習慣長髮造型的法友量身打造。仿真人工手織單針遞針頭皮，可隨心中分、旁分、綁低馬尾或丸子頭，髮絲自然飄逸，完全看不出配戴痕跡。讓您在治療期間依然能以最熟悉、最自信的長髮姿態迎向生活。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '特級特長真人秀髮，髮質滑順無打結，散發健康光澤',
      '超薄醫療親膚邊緣，服貼額前與鬢角，耳後無壓迫痕跡',
      '支持日常多樣造型：可低馬尾、半丸子頭或髮飾裝點',
      '一對一專屬 VIP 包廂內，由特約資深設計師現場修剪客製瀏海層次'
    ],
    stylingTips: '長髮梳理時請從髮尾分段往上輕柔梳開，洗滌後平放陰乾避免重力拉扯。',
    bestFit: '習慣長髮造型、重視造型多樣性、出席重要社交場合之化療抗癌朋友。',
    lifeSpan: '18 - 24 個月'
  },
  {
    id: 'chemo-recovery-topper',
    title: '「新生萌芽・頂部微增透氣護囊髮片」 (Medical Recovery Light Topper)',
    category: 'recovery-topper',
    categoryLabel: '新生過渡款',
    baseMaterial: 'double',
    baseMaterialLabel: '超薄雙層透氣底網',
    priceType: 'custom',
    tag: '生長過渡期・超輕25g・零拉扯毛囊',
    imgUrl: '/images/女生BeforeAfter.jpg',
    description: '針對化療療程結束後新髮萌芽期、或局部落髮病友設計。不壓迫新生細軟毛囊，以極輕量親膚微型夾扣或自適應固定，瞬間遮蓋分線稀疏與頂部不足，陪伴您安心走過毛囊重生的重要修復期。',
    breathability: 5,
    durability: 5,
    naturalness: 5,
    gentleness: 5,
    features: [
      '專為新生細軟脆弱毛囊打造，保留充裕生長呼吸空間與毛囊彈性',
      '專利超輕量微型自適應夾扣，柔軟親膚，牢固且不扯原生細髮',
      '100% 真人真髮，與原生髮流、髮色自然融合，毫無邊界感',
      '超羽量設計僅約 25g，佩戴宛如無物，透氣散熱極佳'
    ],
    stylingTips: '配戴於頂部微增處，以手掌輕輕抓順原生髮與髮片融合即可，自然蓬鬆高顱頂。',
    bestFit: '化療康復後毛髮新生過渡期、圓形禿、產後落髮或頂部局部稀疏者。',
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

  // High-Resolution Lightbox (大圖檢視) state
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
    desc?: string;
    tag?: string;
  } | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form States for Admin
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('清爽短髮款');
  const [newBaseMaterialLabel, setNewBaseMaterialLabel] = useState('雙層防敏透氣醫療網底');
  const [newPriceType, setNewPriceType] = useState<'custom' | 'ready'>('custom');
  const [newTag, setNewTag] = useState('醫療特柔低敏');
  const [newDescription, setNewDescription] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('/images/抗癌2.jpg');
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

  // Keyboard shortcut: Esc to close lightboxes & modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) setLightboxImage(null);
        else if (selectedProduct) setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, selectedProduct]);

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
      alert('請輸入醫療款式分類名稱！');
      return;
    }

    setSubmitting(true);
    try {
      const featureArray = newFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const computedCategory = newCategoryLabel.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');

      const resp = await fetch('/api/wigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chemo',
          title: newTitle,
          category: computedCategory || 'short-bob',
          categoryLabel: newCategoryLabel.trim(),
          baseMaterial: 'double',
          baseMaterialLabel: newBaseMaterialLabel.trim(),
          priceType: newPriceType,
          tag: newTag || '醫療特柔低敏',
          imgUrl: newImgUrl || '/images/抗癌2.jpg',
          description: newDescription || '專為抗癌化療或落髮性頭皮設計，全手工遞針針針精織，仿真生長毛囊，極致透氣舒敏。',
          breathability: Number(newBreathability),
          durability: Number(newDurability),
          naturalness: Number(newNaturalness),
          gentleness: Number(newGentleness),
          features: featureArray.length > 0 ? featureArray : [
            '100% 物理低敏親膚醫療網打底，通過低敏測試，無毒不悶癢',
            '純手工單針遞針精織，呈現天生毛囊與自然頭皮血色',
            '100% 特優級純淨少女真髮，自然柔順可自由吹整修剪',
            '內建多段彈性微調伸縮帶，適應落髮至新生 ±1.5cm 頭圍變化'
          ],
          stylingTips: newStylingTips || '洗頭時使用中性弱酸洗髮精，避免用力搓揉，平鋪陰乾。',
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryFilters = [
    { id: 'all', label: '全部醫療款式 (All)' },
    { id: 'short-bob', label: '俏麗短髮款 (Bob)' },
    { id: 'medium-length', label: '及肩中長款 (Medium)' },
    { id: 'long-style', label: '氣質長髮款 (Long)' },
    { id: 'recovery-topper', label: '新生過渡髮片 (Topper)' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24 text-zinc-900 font-sans selection:bg-[#8e7a64] selection:text-white relative">
      {/* Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#8e7a64] z-50" />

      {/* Header Hero Section: Serene Warm Ivory / Rose-Champagne Aesthetic with Big Photo Showcase */}
      <header className="bg-gradient-to-b from-[#F7F3EE] via-[#FAF7F2] to-white border-b border-[#EAE3D8] text-zinc-900 relative pt-10 pb-16 sm:pb-20 overflow-hidden">
        {/* Subtle Ambient Shapes */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#e8ded2]/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#f0e7df]/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back to Home button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[#786a56] hover:text-zinc-950 font-bold text-xs uppercase tracking-widest bg-white/90 hover:bg-white px-4 py-2 rounded-xl border border-[#ded5c7] shadow-sm cursor-pointer transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-[#8e7a64]" />
              返回官網首頁 (Home)
            </button>
          </div>

          {/* Hero Banner Two-Column Layout with Prominent Large Photo */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Empathetic Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4 text-[#8e7a64]" />
                日本 M.WIG 醫療安心標準 ‧ 100% 頂級純淨真人健康髮絲
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1f1d1a] tracking-tight leading-tight">
                <EditableText
                  idKey="chemo-banner-title"
                  defaultText="化療・醫療級低敏手工真髮專區"
                  as="span"
                  isAdmin={isAdmin}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={onSave || (() => {})}
                /> <br />
                <span className="text-[#8e7a64]">
                  <EditableText
                    idKey="chemo-banner-subtitle"
                    defaultText="溫柔陪伴抗癌與新生時光，守護敏弱頭皮的「極柔透氣與純真自信」"
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
                defaultText="專為面臨癌症化療落髮、放射治療、全頭禿、斑禿及高度脆弱頭皮人士特設。100% 採用純淨真人健康髮絲與日本 M.WIG 標準低敏親膚醫療底網，針針單針純手工精織，內建多段頭圍彈性伸縮調節，以最深切的髮友同理心與獨立 VIP 包廂，陪伴您溫柔度過治療期的每一步。"
                as="p"
                className="text-zinc-650 font-normal text-base sm:text-lg leading-relaxed max-w-2xl"
                isAdmin={isAdmin}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={onSave || (() => {})}
              />

              {/* Quick Feature Badges */}
              <div className="pt-2 flex flex-wrap gap-2.5 text-xs text-zinc-700">
                <span className="bg-white border border-[#ded5c7] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-xs">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64]" /> 100% 特級真人髮，可自由修剪吹整
                </span>
                <span className="bg-white border border-[#ded5c7] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-xs">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64]" /> 雙層物理低敏醫療網，通過肌膚接觸防敏試驗
                </span>
                <span className="bg-white border border-[#ded5c7] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-xs">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64]" /> 1 對 1 獨立 VIP 包廂隱密諮詢與陪伴
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="https://line.me/R/ti/p/@davidhair"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#06C755] hover:bg-[#05b34c] text-white px-7 py-3.5 rounded-xl text-sm font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  預約 1 對 1 VIP 獨立包廂試戴
                </a>
                <a
                  href="#chemo-before-after-showcase"
                  className="bg-white hover:bg-[#f7f3ee] text-zinc-900 border border-[#ded5c7] px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#8e7a64]" />
                  檢視真人改造對比大圖
                </a>
              </div>
            </div>

            {/* Right Column: Prominent Large Image Showcase (大圖展示) */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => setLightboxImage({
                  src: '/images/抗癌2.jpg',
                  title: '抗癌醫療假髮・自然真髮真實佩戴效果',
                  desc: '100% Remy 純淨真人健康髮絲，搭配仿真人工遞針頭皮與雙層親膚低敏底網，無論俯視、撥髮皆如天生長出。',
                  tag: '真實法友佩戴效果 ‧ 點擊檢視高解析大圖'
                })}
                className="relative rounded-3xl overflow-hidden border-2 border-[#ded5c7] shadow-xl bg-white group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-[#8e7a64]"
              >
                {/* Image */}
                <div className="w-full aspect-[4/3] sm:aspect-[16/11] bg-[#f5ede3] overflow-hidden relative">
                  <img loading="lazy" decoding="async"
                    src="/images/抗癌2.jpg"
                    alt="抗癌醫療假髮真實佩戴效果"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Zoom Callout Tag */}
                  <div className="absolute bottom-3 right-3 bg-zinc-950/85 hover:bg-zinc-950 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-transform group-hover:scale-105">
                    <ZoomIn className="w-4 h-4 text-[#ded2c1]" />
                    <span>點擊開啟高解析大圖</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-zinc-900 px-3 py-1 rounded-lg text-xs font-black border border-[#ded5c7] shadow-sm">
                    真實醫療配戴案例
                  </div>
                </div>

                {/* Caption bar */}
                <div className="p-4 bg-white border-t border-[#eae3d8] flex items-center justify-between text-left">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900">溫柔守護抗癌時光 ‧ 找回熟悉自信</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">全頭純手工遞針 ‧ 輕盈無重力 ‧ 雙層微孔親膚醫療網</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">

        {/* SECTION 1: M.WIG 日本醫療假髮安心品質四大檢驗標準 (JIS S 9623 指標) */}
        <section id="m-wig-standards" className="bg-white rounded-3xl border border-[#eae3d8] shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-widest uppercase">
              <Award className="w-4 h-4 text-[#8e7a64]" />
              JIS S 9623 規範標準理念 ‧ M.WIG 醫療假髮安心認證
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
              什麼是 M.WIG 醫療假髮安心標準？
            </h2>
            <p className="text-zinc-650 text-sm sm:text-base font-normal leading-relaxed">
              M.WIG 認證是由日本毛髮工業協同組合依據日本產業規格 <strong>JIS S 9623「醫療用假髮及其附屬品一般規格」</strong> 所推動的嚴苛標準。大衛假髮全面導入此四大安心安全規範，專為化療免疫低落與高度敏弱頭皮打造無微不至的安全守護。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Standard 1: 肌膚貼布無刺激測試 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#eae3d8] flex flex-col space-y-3.5 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-white text-[#8e7a64] border border-[#ded5c7] flex items-center justify-center font-black shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">① 肌膚接觸抗敏測試</h3>
              <p className="text-xs font-bold text-[#8e7a64] font-mono tracking-wider">SKIN PATCH TEST</p>
              <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
                全網底採用物理低敏親膚材質，通過人體皮膚貼布接觸刺激試驗，證實對脆弱紅腫皮膚零刺激、零刺癢，24 小時安心緊貼無負擔。
              </p>
            </div>

            {/* Standard 2: 游離甲醛 0 釋出 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#eae3d8] flex flex-col space-y-3.5 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-white text-[#8e7a64] border border-[#ded5c7] flex items-center justify-center font-black shadow-xs">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">② 游離甲醛 0 釋出</h3>
              <p className="text-xs font-bold text-[#8e7a64] font-mono tracking-wider">FORMALDEHYDE FREE</p>
              <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
                嚴格通過化學檢驗，游離甲醛檢驗值符合極低安全標準，無毒無刺鼻化學異味，為白血球下降與免疫力脆弱期的病友提供純淨防護。
              </p>
            </div>

            {/* Standard 3: 耐汗色牢度最高級 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#eae3d8] flex flex-col space-y-3.5 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-white text-[#8e7a64] border border-[#ded5c7] flex items-center justify-center font-black shadow-xs">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">③ 耐汗色牢度最高等級</h3>
              <p className="text-xs font-bold text-[#8e7a64] font-mono tracking-wider">SWEAT FASTNESS</p>
              <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
                化療期間病友容易因體虛產生虛汗與盜汗。假髮材料具備特級耐汗測試，在高溫汗液浸潤下不脫色、不暈染頭皮與衣物，乾爽舒適。
              </p>
            </div>

            {/* Standard 4: 耐洗耐久色牢度 */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#eae3d8] flex flex-col space-y-3.5 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-white text-[#8e7a64] border border-[#ded5c7] flex items-center justify-center font-black shadow-xs">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">④ 耐洗耐久色牢度</h3>
              <p className="text-xs font-bold text-[#8e7a64] font-mono tracking-wider">WASH FASTNESS</p>
              <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
                經多次清水或弱酸洗髮精清洗，依然維持純淨色澤與柔軟手感。真髮毛鱗片緊密健康，長久配戴不易乾澀褪色與糾結。
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#eae3d8] text-center text-xs text-zinc-600 font-medium">
            💡 大衛假髮貼心承諾：從原物料底網、髮絲篩選到手工勾織，均以「病友安全為第一優先」，全心守護您的健康與自尊。
          </div>
        </section>

        {/* SECTION 2: 化療醫療假髮 4 大安心選購重點 (Selection Guide) */}
        <section id="selection-guide" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-[#8e7a64]" />
              Medical Wig Selection Guide
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
              化療醫療假髮・4 大安心選購重點
            </h2>
            <p className="text-zinc-650 text-sm sm:text-base font-normal leading-relaxed">
              因應化療期間頭皮極度敏弱、體溫調節及頭圍因落髮產生變化，挑選一頂真正合適的醫療假髮應注意以下 4 大關鍵：
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Point 1: 舒適度與親膚透氣 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#eae3d8] shadow-sm flex gap-5 items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center shrink-0 font-black text-lg">
                01
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900">極致親膚溫和與對流排汗透氣</h3>
                <p className="text-zinc-650 text-sm leading-relaxed">
                  化療期間毛囊暫時萎縮，頭皮容易發熱發癢。必須選擇<strong>無化學硬膠、無金屬扣夾</strong>的雙層親膚醫療網底，立體蜂巢微孔形成雙向空氣流道，並配有親膚防滑矽膠，全頭光潔亦能溫柔吸附不滑脫。
                </p>
              </div>
            </div>

            {/* Point 2: 100% 特優真人真髮自然毛流 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#eae3d8] shadow-sm flex gap-5 items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center shrink-0 font-black text-lg">
                02
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900">100% 特級真人髮與針針手工遞針</h3>
                <p className="text-zinc-650 text-sm leading-relaxed">
                  化纖塑膠假髮常有強烈不自然反光且悶熱。大衛堅持採用<strong>100% Remy 純淨少女真髮</strong>，單針手織遞針植入仿真人工頭皮，呈現天生髮旋與毛囊血色，隨風自然飄逸，近距離對視依然自然逼真。
                </p>
              </div>
            </div>

            {/* Point 3: 頭圍彈性微調與極致羽量化 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#eae3d8] shadow-sm flex gap-5 items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center shrink-0 font-black text-lg">
                03
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900">多段伸縮調節帶與輕量無感設計</h3>
                <p className="text-zinc-650 text-sm leading-relaxed">
                  從療程前完整原生髮、落髮期到康復後細軟新髮長出，頭圍會有 <strong>±1.5cm 至 2cm</strong> 的變化。內建精密多段式彈性微調扣帶，配合約 30g~45g 的極致輕量化帽體，長時間配戴無壓迫感。
                </p>
              </div>
            </div>

            {/* Point 4: 1 對 1 獨立 VIP 包廂與沙龍精剪 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#eae3d8] shadow-sm flex gap-5 items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center shrink-0 font-black text-lg">
                04
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900">獨立隱密 VIP 包廂與設計師精修</h3>
                <p className="text-zinc-650 text-sm leading-relaxed">
                  避免在開放空間試戴造成的心理尷尬與壓力。大衛台北、台中、高雄門市皆設有<strong>全隔音 1 對 1 獨立包廂</strong>，由特約資深美髮設計師依您的原生髮生活照，現場量身精剪瀏海、層次比例，神還原健康時的髮型。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: 抗癌落髮「三階段暖心照護指南」 (Soothing Warm Aesthetic) */}
        <section id="chemo-lifecycle" className="bg-[#F7F3EE] p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-[#E4DCCE] text-zinc-900">
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="inline-block bg-white text-[#735f48] border border-[#ded5c7] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
              Care Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-950">
              抗癌陪伴三階段・從容面對秀髮變化
            </h2>
            <p className="text-zinc-650 font-normal text-sm sm:text-base leading-relaxed">
              落髮只是身體戰勝疾病時的暫時過渡。大衛假髮陪伴您走過抗癌前、治療中到新髮萌芽的全程，守護您每個時刻的美麗。
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="bg-white p-7 rounded-2xl border border-[#eae3d8] space-y-4 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#f4ebe1] text-[#735f48] rounded-full text-xs font-mono font-bold">STAGE 01</span>
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-950">化療前 ‧ 落髮前期 (預約準備期)</h3>
              <p className="text-xs font-bold text-[#8e7a64]">建議時機：第 1 次化療後 7-14 天落髮前</p>
              <ul className="text-xs text-zinc-650 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>提前預約 1 對 1 獨立 VIP 包廂，記錄健康時的原生髮色、長度與髮旋。</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>提前挑選合適版型與試戴，消除未知落髮帶來的心理衝擊與不安。</span>
                </li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="bg-white p-7 rounded-2xl border border-[#eae3d8] space-y-4 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#f4ebe1] text-[#735f48] rounded-full text-xs font-mono font-bold">STAGE 02</span>
                <Heart className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-950">化療治療中 ‧ 完全落髮期 (安心防護期)</h3>
              <p className="text-xs font-bold text-[#8e7a64]">防護重點：頭皮極致低敏、透氣與自然自信</p>
              <ul className="text-xs text-zinc-650 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>以極柔親膚醫療網取代悶熱毛帽，舒適透氣、不悶汗、不摩擦頭皮。</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>多段式微調帶隨時因應頭型調整，安心外出工作、就診、訪友，正常過生活。</span>
                </li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="bg-white p-7 rounded-2xl border border-[#eae3d8] space-y-4 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#f4ebe1] text-[#735f48] rounded-full text-xs font-mono font-bold">STAGE 03</span>
                <Sparkles className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-950">療程結束後 ‧ 新髮萌芽期 (毛囊呵護期)</h3>
              <p className="text-xs font-bold text-[#8e7a64]">照護重點：零拉扯保護細軟新生毛囊</p>
              <ul className="text-xs text-zinc-650 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>新生毛髮細軟嬌嫩，微調扣帶放寬頭圍，或換戴「新生過渡頂部微增髮片」。</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                  <span>門市提供終身修剪與微調售後，溫柔陪伴原生秀髮重新濃密如初。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: 真人實證前後對比 (大圖呈現 & 點擊放大檢視) */}
        <section id="chemo-before-after-showcase" className="bg-white rounded-3xl border border-[#eae3d8] shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#8e7a64]" />
              Medical Transformation Case
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              醫療化療假髮・真人改造前後對比 (Before & After)
            </h2>
            <p className="text-zinc-650 text-sm sm:text-base font-normal leading-relaxed">
              溫柔守護抗癌時光的自信與美麗。醫療網等級底網，全頭純手工微雕，360° 透氣服貼零壓迫。
            </p>
          </div>

          {/* Unified Before/After Showcase Card (大圖呈現) */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#ded5c7] shadow-xl bg-zinc-950">
            {/* Header Direction Bar */}
            <div className="grid grid-cols-2 bg-zinc-900 border-b border-zinc-800 text-white p-3.5 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-white font-black text-sm sm:text-base border-r border-zinc-700/80 pr-2">
                <Sparkles className="w-4 h-4 text-[#ded2c1]" />
                <span>改造後 (AFTER)</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#8e7a64] text-white shadow-md">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-zinc-200 font-black text-sm sm:text-base pl-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                <span>改造前 (BEFORE)</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 shadow-md">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </span>
              </div>
            </div>

            {/* Clickable Large Image Container */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/化療BeforeAfter.jpg',
                title: '醫療化療假髮・真人改造前後對比 (Before & After)',
                desc: '左側為配戴 100% 真人真髮醫療全手織假髮後自然蓬鬆效果；右側為治療落髮期。透過頂級純手工遞針工藝，重現豐盈自然秀髮。',
                tag: '真實法友案例 ‧ 高解析大圖檢視'
              })}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] bg-zinc-950 flex items-center justify-center overflow-hidden cursor-pointer group"
            >
              <img loading="lazy" decoding="async" 
                src="/images/化療BeforeAfter.jpg" 
                alt="醫療化療假髮・真人改造前後對比" 
                className="w-full h-full object-contain bg-zinc-950 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Callout Tag Left */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-[#8e7a64] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2 text-xs sm:text-sm font-black">
                <Sparkles className="w-4 h-4 text-white" />
                <span>AFTER 改造後</span>
              </div>

              {/* Callout Tag Right */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-zinc-950/90 backdrop-blur-md text-zinc-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-zinc-700 shadow-xl flex items-center gap-2 text-xs sm:text-sm font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-ping" />
                <span>BEFORE 改造前</span>
              </div>

              {/* Center Magnifier Hover Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-xl">
                <ZoomIn className="w-4 h-4 text-[#ded2c1]" />
                <span>點擊開啟全螢幕高解析大圖 (Zoom)</span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-zinc-900 border-t border-zinc-800 text-white p-3.5 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-bold text-zinc-200 text-center sm:text-left">
                <span className="text-[#ded2c1] font-black">【病友實證蛻變】</span> 100% 純淨真髮 ‧ 醫療網等級內網 ‧ 360° 舒適透氣零壓迫
              </div>
              <a
                href="https://line.me/R/ti/p/@davidhair"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                LINE 醫療專員預約諮詢
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 5: 底網結構與職人工藝【高解析大圖展示專區】 (Large Craft Photos Gallery) */}
        <section id="cap-craft-gallery" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-widest uppercase">
              <ImageIcon className="w-4 h-4 text-[#8e7a64]" />
              High-Resolution Craft Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
              底網材質與純手工工藝・高解析大圖特寫
            </h2>
            <p className="text-zinc-650 text-sm sm:text-base font-normal leading-relaxed">
              點擊下方任一大圖，即可開啟全螢幕高解析放大檢視，近距離查看雙層醫療底網微孔、手工單針遞針與專屬量模細節
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                src: '/images/雙層網.jpg',
                title: '雙層防敏透氣醫療底網 (特寫大圖)',
                subtitle: 'Double Anti-Allergy Mesh',
                desc: '專為全光頭與脆弱發炎頭皮打造。內層超細親膚蠶絲觸感，外層立體高透氣微孔蜂巢結構，雙向對流不悶汗。'
              },
              {
                src: '/images/醫療網.jpg',
                title: '親膚無感立體微孔網帽 (特寫大圖)',
                subtitle: 'Medical Micro-Pore Cap',
                desc: '通過 JIS S 9623 人體貼布防敏測試，邊緣極致羽化貼合額前與鬢角，跑步低頭依然服貼不移位。'
              },
              {
                src: '/images/手工.png',
                title: '純手工單針遞針一針一線 (特寫大圖)',
                subtitle: 'Pure Hand-Crafted Injected Knotting',
                desc: '專業職人耗時數十天，每根髮絲純手工單根遞針織入，完整還原天然毛囊生長血色感與自然髮旋。'
              },
              {
                src: '/images/量頭模.png',
                title: '專屬頭型 3D 弧度量模客製 (特寫大圖)',
                subtitle: '3D Head-Molding Customization',
                desc: '大衛哥親自為您精密測量頭型曲率、耳骨距離與落髮邊界，打造 100% 貼合個人骨相的專屬客製假髮。'
              },
              {
                src: '/images/化療工具.jpg',
                title: '專業沙龍配件與護理工具組 (特寫大圖)',
                subtitle: 'Professional Medical Wig Tools',
                desc: '門市提供專屬弱酸性溫和護理清潔組、防靜電氣囊寬齒梳與微調伸縮配件，讓您日常清潔保養輕鬆從容。'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage({
                  src: item.src,
                  title: item.title,
                  desc: item.desc,
                  tag: item.subtitle
                })}
                className="bg-white rounded-3xl border border-[#eae3d8] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8e7a64] transition-all duration-300 flex flex-col group cursor-pointer text-left"
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/3] bg-[#f5ede3] relative overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-zinc-900 px-3 py-1 rounded-lg text-xs font-black border border-[#ded5c7] shadow-xs">
                    {item.subtitle}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-zinc-950/80 hover:bg-zinc-950 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 backdrop-blur-sm">
                    <ZoomIn className="w-3.5 h-3.5 text-[#ded2c1]" />
                    <span>放大檢視</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 group-hover:text-[#8e7a64] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-zinc-650 text-xs leading-relaxed mt-1.5">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#f0e9e1] flex items-center justify-between text-xs font-bold text-[#8e7a64]">
                    <span>點擊檢視高解析大圖</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: 醫療假髮精選款式全系列 (Product Catalog Grid with Large Images) */}
        <section id="chemo-products-grid" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#eae3d8] pb-6">
            <div className="space-y-2 text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4ebe1] text-[#735f48] text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#8e7a64]" />
                Medical Wig Models
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
                醫療假髮・精選款式與型號
              </h2>
              <p className="text-zinc-650 text-sm font-normal">
                精選短髮、中長髮、長髮與過渡髮片，每款皆支持 100% 現場依臉型修剪（點擊大圖可開啟高清檢視）
              </p>
            </div>

            {/* Admin Add Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 bg-[#8e7a64] hover:bg-[#7a6854] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showAddForm ? '取消新增' : '新增醫療假髮型號'}
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {categoryFilters.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#8e7a64] text-white shadow-md'
                    : 'bg-white text-zinc-700 hover:bg-[#FAF7F2] border border-[#ded5c7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Admin Add Form */}
          {isAdmin && showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddWig}
              className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#ded5c7] shadow-xl space-y-4 text-left"
            >
              <h3 className="font-black text-lg text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#8e7a64]" />
                新增醫療化療假髮款式
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">款式品名/型號</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例：俏麗短髮全手織醫療假髮"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">分類標籤</label>
                  <select
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white"
                  >
                    <option value="清爽短髮款">清爽短髮款</option>
                    <option value="及肩中長款">及肩中長款</option>
                    <option value="氣質長髮款">氣質長髮款</option>
                    <option value="新生過渡款">新生過渡款</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">精選特點 Tag</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="例：抗癌首選・極柔親膚"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">展示圖片路徑</label>
                  <input
                    type="text"
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="/images/抗癌2.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1 text-xs">商品詳細描述</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="請輸入款式設計理念、適用人群與材質說明..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#8e7a64] text-white hover:bg-[#7a6854] flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  確認儲存型號
                </button>
              </div>
            </motion.form>
          )}

          {/* Products Grid: Spacious 2 to 3 Columns with Large Image Focus */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="bg-white rounded-3xl border border-[#eae3d8] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8e7a64] transition-all duration-300 flex flex-col group cursor-pointer text-left"
              >
                {/* Large Image Aspect Box */}
                <div className="w-full aspect-[16/11] sm:aspect-[16/10] bg-[#f5ede3] relative overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={prod.imgUrl || '/images/抗癌2.jpg'}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-black text-zinc-900 border border-[#ded5c7] shadow-xs">
                    {prod.categoryLabel}
                  </div>

                  {/* 100% Real Hair Badge */}
                  <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                    100% 真人真髮
                  </div>

                  {/* Zoom to Big Image Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({
                        src: prod.imgUrl || '/images/抗癌2.jpg',
                        title: prod.title,
                        desc: prod.description,
                        tag: prod.tag
                      });
                    }}
                    className="absolute bottom-3 right-3 bg-zinc-950/85 hover:bg-zinc-950 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md backdrop-blur-sm transition-transform group-hover:scale-105 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#ded2c1]" />
                    <span>檢視高解析大圖</span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-[#8e7a64] tracking-wide block">{prod.tag}</span>
                    <h3 className="font-black text-lg text-zinc-950 group-hover:text-[#8e7a64] transition-colors line-clamp-2 leading-snug">
                      {prod.title}
                    </h3>
                    <p className="text-zinc-650 text-xs sm:text-sm line-clamp-2 font-normal leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Indicators */}
                  <div className="space-y-2 pt-3 border-t border-[#f0e9e1] text-xs">
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="font-medium">親膚柔敏度 (Gentleness)</span>
                      <span className="font-bold text-[#8e7a64]">{prod.gentleness || 5}/5</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8e7a64] rounded-full" style={{ width: `${((prod.gentleness || 5) / 5) * 100}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-zinc-700 pt-1">
                      <span className="font-medium">排汗透氣度 (Breathability)</span>
                      <span className="font-bold text-[#8e7a64]">{prod.breathability || 5}/5</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a8927a] rounded-full" style={{ width: `${((prod.breathability || 5) / 5) * 100}%` }} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#f0e9e1]">
                    <span className="text-xs font-black text-zinc-800 flex items-center gap-1 group-hover:text-[#8e7a64] transition-colors">
                      查看完整規格詳情 <Eye className="w-3.5 h-3.5" />
                    </span>
                    <a
                      href="https://line.me/R/ti/p/@davidhair"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-zinc-950 hover:bg-[#8e7a64] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      LINE 預約包廂試戴
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: 化療假髮常見問題 FAQ (Medical Wig FAQ) */}
        <section id="chemo-faq" className="bg-white rounded-3xl border border-[#eae3d8] shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ebe1] text-[#735f48] border border-[#dfd2c0] text-xs font-black tracking-widest uppercase">
              <HelpCircle className="w-4 h-4 text-[#8e7a64]" />
              Medical Wig Q&A
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
              化療醫療假髮・常見問題解答 (FAQ)
            </h2>
            <p className="text-zinc-650 text-sm sm:text-base font-normal leading-relaxed">
              整理法友在化療前後最常諮詢的 6 大核心疑問，為您提供最安心透明的解答
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: "什麼時候去挑選化療假髮最合適？",
                a: "強烈建議在第一次化療後 7-14 天、原生頭髮尚未大量掉落前預約到店。此時門市造型師能完整記錄您健康時的原生髮型、長度、髮旋與髮色，提前為您比對修剪。先準備好假髮，能大幅消除面臨落髮時的心理恐懼與焦慮。"
              },
              {
                q: "為什麼醫療假髮強烈建議使用 100% 真人真髮，而非一般平價化纖假髮？",
                a: "一般市售化纖假髮多由塑膠聚酯纖維製成，光澤反光強烈、材質僵硬且極不透氣，容易使脆弱發炎的頭皮產生刺癢與毛囊炎。大衛醫療假髮堅持 100% Remy 純淨健康真髮，毛鱗片順向排列，光澤自然且透氣，可隨意吹整、修剪瀏海，最接近天生真髮。"
              },
              {
                q: "炎熱夏天戴得住嗎？容易流汗會不會悶熱？",
                a: "大衛醫療假髮底網依循日本 M.WIG 標準設計，採用立體雙層微孔網底，孔隙高達數千個，透氣排汗效率極佳。配合吸濕排汗結構與親膚防滑矽膠，即使在台灣炎夏外出，也能維持頭皮通爽呼吸，不易引起汗疹。"
              },
              {
                q: "大衛假髮是否有配合辦理政府或醫院輔具補助？",
                a: "大衛假髮堅持定價透明、拒絕疊加虛報成本，將所有心思與資源百分之百投入於頂級真髮工藝、純手工單針遞針與獨立 VIP 包廂服務。為維持最純粹實惠的價格，我們目前「不配合、不提供辦理」政府或醫療機構之輔具補助申請，敬請法友體諒。"
              },
              {
                q: "平時該如何清潔與保養假髮？睡覺時需要戴嗎？",
                a: "建議每佩戴 7-10 天清洗一次。清洗時使用弱酸性溫和洗髮精，平鋪於水中順向輕壓清洗，切勿用力搓揉，再以毛巾吸乾水份後自然陰乾即可。睡覺時建議摘下假髮，讓頭皮充分休息放鬆，亦可換戴純棉或真絲親膚睡帽保暖。"
              },
              {
                q: "門市試戴需要預約嗎？有提供獨立包廂嗎？",
                a: "為了守護每位抗癌朋友的個人隱私與尊嚴，大衛台北、台中、高雄門市皆採「完全預約制」，並設有全隔音 1 對 1 獨立 VIP 包廂。諮詢過程絕無任何陌生人打擾，您可以安心由家人陪伴前來試戴與體驗。"
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#eae3d8] rounded-2xl overflow-hidden bg-[#FAF7F2] transition-colors text-left"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left font-black text-sm sm:text-base text-zinc-900 flex justify-between items-center gap-4 cursor-pointer hover:text-[#8e7a64] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f4ebe1] text-[#8e7a64] flex items-center justify-center text-xs font-mono shrink-0 font-bold">
                      Q
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180 text-[#8e7a64]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-650 leading-relaxed border-t border-[#eae3d8] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: 底部暖心呼籲與官方 LINE 預約卡片 (Warm Champagne / Taupe Harmony) */}
        <div className="bg-[#8e7a64] rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block bg-white/20 text-white border border-white/30 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
              Private Medical Care & Empathy
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              溫柔守護抗癌時光，找回熟悉自信笑容
            </h3>
            <p className="text-white/90 font-normal text-xs sm:text-sm md:text-base leading-relaxed">
              大衛假髮創辦人身為髮友，以同理心全心呵護每位面對抗癌或落髮考驗的朋友。加入官方 LINE 留言預約，我們將在全隔音獨立 VIP 包廂內為您貼心試戴。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a
                href="https://line.me/R/ti/p/@davidhair"
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-950 hover:bg-zinc-900 text-white px-8 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-[#06C755]" />
                預約一對一 VIP 獨立試戴
              </a>
              <button
                onClick={onBack}
                className="bg-white/90 hover:bg-white text-zinc-950 px-8 py-4 rounded-xl text-sm font-bold transition-all cursor-pointer shadow"
              >
                返回官網首頁
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* FULL-SCREEN HIGH RESOLUTION LIGHTBOX (高解析大圖檢視燈箱) */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 max-w-5xl w-full max-h-[92vh] flex flex-col z-10"
            >
              {/* Top Bar */}
              <div className="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#8e7a64]/20 border border-[#8e7a64]/40 flex items-center justify-center text-[#ded2c1] shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <h4 className="font-extrabold text-sm sm:text-base text-white truncate">
                      {lightboxImage.title}
                    </h4>
                    {lightboxImage.tag && (
                      <span className="text-[11px] text-[#ded2c1] font-bold block truncate">
                        {lightboxImage.tag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="關閉大圖 (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Image Area (Uncropped High Resolution) */}
              <div className="flex-1 bg-zinc-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative min-h-[300px]">
                <img loading="lazy" decoding="async"
                  src={lightboxImage.src}
                  alt={lightboxImage.title}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Footer Explanation Bar */}
              {lightboxImage.desc && (
                <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 text-left space-y-1">
                  <span className="text-[11px] font-bold text-[#ded2c1] tracking-wider uppercase">細節解析與材質說明</span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {lightboxImage.desc}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative bg-white rounded-3xl shadow-2xl border border-[#eae3d8] max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 overflow-hidden text-zinc-900 text-left"
            >
              <div className="h-2 bg-[#8e7a64]" />
              
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="text-[11px] font-black tracking-widest text-[#735f48] bg-[#f4ebe1] border border-[#dfd2c0] rounded-lg px-2.5 py-1 uppercase inline-block mb-3">
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
                  <div className="text-zinc-650 text-sm sm:text-base leading-relaxed font-normal">
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

                {/* Product Large Image Preview Inside Modal */}
                <div 
                  onClick={() => setLightboxImage({
                    src: selectedProduct.imgUrl || '/images/抗癌2.jpg',
                    title: selectedProduct.title,
                    desc: selectedProduct.description,
                    tag: selectedProduct.tag
                  })}
                  className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#f5ede3] border border-[#ded5c7] relative group cursor-pointer"
                >
                  <img loading="lazy" decoding="async"
                    src={selectedProduct.imgUrl || '/images/抗癌2.jpg'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-zinc-950/80 hover:bg-zinc-950 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                    <ZoomIn className="w-3.5 h-3.5 text-[#ded2c1]" />
                    <span>放大檢視高解析大圖</span>
                  </div>
                </div>

                {/* Main grid detailing specification and care details */}
                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-[#f0e9e1]">
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase">內網貼膚底材種類</span>
                      <strong className="text-zinc-800 font-extrabold text-sm">{selectedProduct.baseMaterialLabel}</strong>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase">平均推薦耐用壽命</span>
                      <strong className="text-zinc-800 font-extrabold text-sm">{selectedProduct.lifeSpan}</strong>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 tracking-widest uppercase font-mono">產品工藝特色及製法</span>
                      <div className="space-y-1.5 mt-1">
                        {selectedProduct.features?.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-650">
                            <Check className="w-3.5 h-3.5 text-[#8e7a64] mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#eae3d8] space-y-3">
                      <span className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase">親膚級智能指標</span>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">極柔低敏感</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{(selectedProduct.gentleness || 5)}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8e7a64] rounded-full" style={{ width: `${((selectedProduct.gentleness || 5) / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">排汗透氣度</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{selectedProduct.breathability}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8e7a64] rounded-full" style={{ width: `${(selectedProduct.breathability / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-zinc-700">逼真自然度</span>
                            <span className="font-mono text-zinc-800 font-extrabold">{selectedProduct.naturalness}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8e7a64] rounded-full" style={{ width: `${(selectedProduct.naturalness / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4 border-t border-[#f0e9e1]">
                  <div>
                    <span className="block text-xs font-black text-[#8e7a64] tracking-widest uppercase mb-1">對象客群最佳推薦</span>
                    <p className="text-sm text-zinc-700 leading-relaxed font-normal">{selectedProduct.bestFit}</p>
                  </div>

                  <div>
                    <span className="block text-xs font-black text-[#8e7a64] tracking-widest uppercase mb-1">日常護理與清潔注意事項</span>
                    <p className="text-sm text-zinc-700 leading-relaxed font-normal">{selectedProduct.stylingTips}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {(isAdmin || isEditMode) && (
                    <button
                      onClick={(e) => {
                        const targetId = selectedProduct.id;
                        handleDeleteWig(targetId, e);
                      }}
                      className="px-5 py-3.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      刪除此款
                    </button>
                  )}
                  <a
                    href="https://line.me/R/ti/p/@davidhair"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs py-3.5 rounded-xl shadow transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    LINE 預約抗癌醫療一對一樣模
                  </a>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-bold text-xs rounded-xl transition-all cursor-pointer"
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

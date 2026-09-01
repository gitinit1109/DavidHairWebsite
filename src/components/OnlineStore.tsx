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

// Default accessories & consumables — sourced from davidhair.com.tw's real product
// catalog (https://www.davidhair.com.tw/h/Product?key=p5m4u&cateId=86894) rather than
// placeholder items, so prices/images reflect what the store actually carries.
const DAVIDHAIR_IMG_BASE = 'https://www.davidhair.com.tw';

const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  // --- 假髮膠帶 ---
  {
    id: 'acc-tape-walker-36y-multicolor',
    title: '【36碼專區 WALKER TAPE】紅膠 白膠 紫膠 藍膠 綠膠 NO-SHINE 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 850,
    priceMax: 2000,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_430053_bmv077ar.jpg`,
    description: '美國 Walker Tape 原廠 36 碼大容量裝，多種膠色可選，適合長期配戴、需要頻繁更換膠帶的髮友，換算下來最划算。',
    tag: '美國原廠進口・大容量裝'
  },
  {
    id: 'acc-tape-ultra-hold',
    title: '【沃克白膠 ULTRA HOLD】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 250,
    priceMax: 900,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_430054_iai59i5y.jpg`,
    description: '防水防油、超強黏力，適合運動流汗或需要長效牢固的配戴需求。',
    tag: '超強黏力'
  },
  {
    id: 'acc-tape-walker-signature',
    title: '【二代白膠 WALKER SIGNATURE TAPE】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 300,
    priceMax: 1100,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450587_f9687v80.jpg`,
    description: 'Walker Tape 二代升級配方白膠，黏性與親膚度皆有提升，日常配戴首選。',
    tag: '二代升級配方'
  },
  {
    id: 'acc-tape-signature-sensi-tak',
    title: '【二代紅膠 WALKER SIGNATURE SENSI-TAK SELECT】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 220,
    priceMax: 620,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450559_5132suji.jpg`,
    description: '低致敏配方，好撕好清理，適合敏感頭皮日常配戴使用。',
    tag: '低致敏・好清理'
  },
  {
    id: 'acc-tape-extenda-bond-plus',
    title: '【打孔藍膠 EXTENDA-BOND PLUS】打孔膠 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 350,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450754_afjvri4j.jpg`,
    description: '打孔設計加強透氣與貼合度，適合蕾絲網底、追求隱形無感邊緣的髮友。',
    tag: '打孔透氣款'
  },
  {
    id: 'acc-tape-sensi-tak',
    title: '【沃克紅膠 SENSI-TAK】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 185,
    priceMax: 600,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_447310_z762nvj1.jpg`,
    description: 'Walker Tape 熱銷經典紅膠，易清理、低致敏，新手入門首選膠帶。',
    tag: '熱銷經典款'
  },
  {
    id: 'acc-tape-base-tape',
    title: '【單面打底膠 BASE TAPE】蕾絲網底打底膠 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 245,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450606_he7qfcj8.jpg`,
    description: '單面設計專為蕾絲網底打底使用，加強邊緣服貼、延長配戴穩固度。',
    tag: '蕾絲網底專用'
  },
  {
    id: 'acc-tape-lace-front',
    title: '【沃克藍膠 LACE FRONT】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 280,
    priceMax: 850,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_447302_ew2avegi.jpg`,
    description: '頂級強效、超薄服貼，蕾絲髮際線配戴的熱門選擇。',
    tag: '頂級強效'
  },
  {
    id: 'acc-tape-no-shine',
    title: '【低反光膠 No-Shine】啞光膠 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 290,
    priceMax: 990,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450635_rawvnfg2.jpg`,
    description: '啞光低反光配方，近距離也不易反光，追求極致隱形效果的首選。',
    tag: '隱形啞光'
  },
  {
    id: 'acc-tape-super-stick',
    title: '【沃克紫膠 SUPER STICK】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 210,
    priceMax: 650,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_431026_fm2na586.jpg`,
    description: '薄透無感、親膚安全，兼顧牢固與配戴舒適度的平衡款。',
    tag: '薄透無感'
  },
  {
    id: 'acc-tape-1522-clear',
    title: '【1522日用膠 WALKERTAPE 1522clear】美國原廠假髮膠帶 敏感頭皮專用',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 220,
    priceMax: 470,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450596_vc4rs5nf.jpg`,
    description: '敏感頭皮專用配方，日常配戴溫和不刺激。',
    tag: '敏感頭皮專用'
  },
  {
    id: 'acc-tape-pro-flex-ii',
    title: '【強效膠帶 Pro-Flex II】敏感頭皮專用 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 360,
    priceMax: 850,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450648_kpzz0j4x.jpg`,
    description: '強效黏著搭配敏感頭皮配方，兼顧牢固度與親膚舒適。',
    tag: '強效敏感肌適用'
  },
  {
    id: 'acc-tape-natural-hold',
    title: '【沃克棕膠 Natural Hold】蕾絲網底專用打底膠 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 230,
    priceMax: 700,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450599_fge33t0c.jpg`,
    description: '棕色膠帶更貼近自然膚色，蕾絲網底打底使用不易顯色。',
    tag: '蕾絲網底專用'
  },
  {
    id: 'acc-tape-vapon-clear',
    title: '【日用膠 VAPON TOPSTICK Clear Tape】敏感頭皮專用 VAPON原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 220,
    priceMax: 980,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450699_nixntd3a.jpg`,
    description: 'VAPON 原廠日用款，敏感頭皮也能安心天天配戴。',
    tag: 'VAPON原廠・日用款'
  },
  {
    id: 'acc-tape-vapon-plus',
    title: '【強效膠帶 VAPON Topstick Plus】VAPON原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 320,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450701_3t6xn4xx.jpg`,
    description: 'VAPON 原廠強效版本，需要更持久牢固度時的升級選擇。',
    tag: 'VAPON原廠・強效版'
  },
  {
    id: 'acc-tape-vapon-lacefx',
    title: '【蕾絲膠 VAPON LaceFX】蕾絲網底專用膠 低反光膠帶 VAPON原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠帶',
    price: 250,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450700_3dmaycjq.jpg`,
    description: 'VAPON 原廠蕾絲網底專用膠，低反光設計貼合更隱形。',
    tag: '蕾絲網底專用'
  },

  // --- 假髮膠片 ---
  {
    id: 'acc-patch-walker-signature-36',
    title: '【二代白膠膠片 WALKER SIGNATURE TAPE-36片】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 350,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451139_qqrjk16m.jpg`,
    description: '預先裁切好的膠片款式，免剪裁即可直接使用，方便快速。',
    tag: '免裁切・即用款'
  },
  {
    id: 'acc-patch-sensi-tak-36',
    title: '【紅膠膠片 Sensi-Tak-36片】美國沃克原廠假髮膠片',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 230,
    priceMax: 250,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450906_3ay9zawe.jpg`,
    description: '經典紅膠裁切成片狀，好撕好清理，新手最容易上手的膠片款式。',
    tag: '新手好上手'
  },
  {
    id: 'acc-patch-natural-hold-36',
    title: '【棕膠膠片 Natural Hold-36片】美國沃克原廠假髮膠帶 蕾絲網底專用打底膠',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 230,
    priceMax: 240,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450910_2g7ywpia.jpg`,
    description: '棕色膠片貼近膚色，蕾絲網底打底使用不易顯色破綻。',
    tag: '蕾絲網底專用'
  },
  {
    id: 'acc-patch-duo-tac-36',
    title: '【雙效膠片 Duo-Tac-36片】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 285,
    priceMax: 300,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451250_tb379pvg.jpg`,
    description: '雙面雙效設計，兼顧黏著力與親膚舒適的均衡款膠片。',
    tag: '雙效均衡款'
  },
  {
    id: 'acc-patch-ultrahold-36',
    title: '【白膠膠片 UltraHold-36片】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 280,
    priceMax: 330,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451243_zdt51yfh.jpg`,
    description: '防水防油、超強黏力的白膠裁切片，適合運動流汗場合。',
    tag: '超強黏力'
  },
  {
    id: 'acc-patch-lace-front-36',
    title: '【藍膠膠片 LACE FRONT-36片】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 300,
    priceMax: 320,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451195_d2dz197z.jpg`,
    description: '頂級強效藍膠裁切成片，蕾絲髮際線配戴的熱門選擇。',
    tag: '頂級強效'
  },
  {
    id: 'acc-patch-signature-sensi-tak-36',
    title: '【二代紅膠膠片 WALKER SIGNATURE SENSI-TAK SELECT-36片】美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 250,
    priceMax: 280,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451239_kd4edua1.jpg`,
    description: '二代升級配方紅膠片，低致敏好清理，日常配戴首選。',
    tag: '低致敏配方'
  },
  {
    id: 'acc-patch-extenda-bond-plus',
    title: '【打孔藍膠片 EXTENDA-BOND PLUS-2款任選】打孔膠 美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 75,
    priceMax: 350,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451196_40dx3wtp.jpg`,
    description: '打孔設計加強透氣度，提供 2 款規格任選，依需求彈性選購。',
    tag: '打孔透氣・2款任選'
  },
  {
    id: 'acc-patch-super-stick-36',
    title: '【SUPER STICK紫膠膠片36片】美國沃克原廠假髮膠片',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 250,
    priceMax: 265,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450920_my51nf8w.jpg`,
    description: '薄透無感紫膠裁切成片，兼顧牢固與舒適度的平衡款。',
    tag: '薄透無感'
  },
  {
    id: 'acc-patch-noshine-36',
    title: '【低反光膠片 NOSHINE-36片】美國沃克原廠假髮膠片',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 330,
    priceMax: 350,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450921_fwjvmiiw.jpg`,
    description: '啞光低反光配方裁切成片，追求極致隱形效果的首選。',
    tag: '隱形啞光'
  },
  {
    id: 'acc-patch-1522clear-36',
    title: '【日用膠片 1522clear-36片】敏感頭皮專用 WALKERTAPE美國原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 230,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451126_yksbw5fp.jpg`,
    description: '敏感頭皮專用日用款裁切成片，天天配戴也溫和不刺激。',
    tag: '敏感頭皮專用'
  },
  {
    id: 'acc-patch-lacefx-25',
    title: '【蕾絲膠片 Lace FX-25片盒裝】蕾絲網底專用 VAPON原廠假髮膠帶',
    category: 'accessories',
    categoryLabel: '假髮膠片',
    price: 280,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_450911_2rw8wk4u.jpg`,
    description: 'VAPON 原廠蕾絲網底專用膠片，25 片盒裝方便攜帶收納。',
    tag: '蕾絲網底專用・盒裝'
  },

  // --- 假髮膠水 ---
  {
    id: 'acc-glue-liquid-adhesive',
    title: '【假髮專用液態膠水 LIQUID ADHESIVES】WALKER原廠假髮專用膠水',
    category: 'accessories',
    categoryLabel: '假髮膠水',
    price: 360,
    priceMax: 1150,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451513_gi70cf69.jpg`,
    description: '超強黏性液態膠水，防水效果佳，夏天游泳下水也不必擔心脫落。',
    tag: '超強黏性・防水'
  },
  {
    id: 'acc-glue-just-rite',
    title: '【緩衝劑 Just-Rite-118ml】WALKER TAPE原廠進口',
    category: 'accessories',
    categoryLabel: '假髮膠水',
    price: 450,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451506_7wf874yx.jpg`,
    description: '搭配液態膠水使用的緩衝劑，調整黏著效果與延長使用時間。',
    tag: 'WALKER TAPE原廠進口'
  },
  {
    id: 'acc-glue-max-hold-sport',
    title: '【髮片助黏劑 Max Hold Sport-41ml】WALKER TAPE原廠進口',
    category: 'accessories',
    categoryLabel: '假髮膠水',
    price: 500,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451505_k6p5njsy.jpg`,
    description: '運動型強力助黏劑，適合劇烈運動、大量流汗場合加強黏著。',
    tag: '運動型強力款'
  },
  {
    id: 'acc-glue-gw14-protein',
    title: '【GW1.4蛋白膠 Walker Great White-41ml】Walker沃克原廠 隱形假髮專用膠',
    category: 'accessories',
    categoryLabel: '假髮膠水',
    price: 950,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451504_yu4k832z.jpg`,
    description: '蛋白配方專為隱形假髮設計，黏著自然且不易泛白反光。',
    tag: '隱形假髮專用'
  },

  // --- 卸膠專區 ---
  {
    id: 'acc-remover-great-white',
    title: '【H2GO蛋白膠專用拆髮劑 Great White Remover-118ml】Walker沃克原廠 蛋白膠專用卸除劑',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 450,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451500_fntmib7v.jpg`,
    description: '專為蛋白膠配方設計的卸除劑，溫和分解殘膠，不傷頭皮與髮絲。',
    tag: '蛋白膠專用'
  },
  {
    id: 'acc-remover-rapid-release',
    title: '【強效卸膠液 RAPID RELEASE-354ml】除膠噴霧 沃克原廠假髮膠帶卸膠液',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 850,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451337_gjnc7nnj.jpg`,
    description: '噴霧式強效卸膠液，大容量裝適合門市/沙龍高頻使用。',
    tag: '大容量噴霧裝'
  },
  {
    id: 'acc-remover-lace-release',
    title: '【蕾絲網底拆髮劑 Walker Lace Release-118ml】假髮殘膠卸除',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 500,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451270_fx35n4qz.jpg`,
    description: '專為蕾絲網底設計的溫和卸膠配方，卸除殘膠同時保護細緻網底。',
    tag: '蕾絲網底專用'
  },
  {
    id: 'acc-remover-s3-sensitive',
    title: '【S3™卸膠液 SENSITIVE SKIN SOLVENT-118ml】敏感頭皮專用 假髮殘膠卸除',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 500,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451269_67myqpxa.jpg`,
    description: '敏感頭皮專用溫和配方，卸除殘膠時不刺激、不泛紅。',
    tag: '敏感頭皮專用'
  },
  {
    id: 'acc-remover-signature',
    title: '【沃克卸膠液 WALKER SIGNATURE REMOVER-118ml】敏感頭皮專用',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 750,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451268_kxx1pwnn.jpg`,
    description: 'Walker 原廠敏感頭皮專用配方卸膠液，溫和有效不傷頭皮。',
    tag: 'Walker原廠・敏感肌適用'
  },
  {
    id: 'acc-remover-c22',
    title: '【C-22卸膠液 C-22 SOLVENT】Walker銷量第一假髮膠帶卸除液',
    category: 'accessories',
    categoryLabel: '卸膠專區',
    price: 450,
    priceMax: 950,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_451266_3ysxnu9w.jpg`,
    description: 'Walker 銷量第一的柑橘配方卸膠液，一分鐘快速分解殘膠，清水沖淨無殘留。',
    tag: '銷量第一・柑橘配方'
  },

  // --- 日常保養 ---
  {
    id: 'acc-care-knot-sealer',
    title: '【假髮網底保養劑 Top-Loc KNOT SEALER-118ml】WALKER TAPE原廠進口免洗假髮網底保養劑',
    category: 'accessories',
    categoryLabel: '日常保養',
    price: 870,
    imgUrl: `${DAVIDHAIR_IMG_BASE}/Uploads/Product/s/38636/38636_452034_ntzxem9s.jpg`,
    description: '免洗型網底保養劑，定期使用可延長底網彈性與使用壽命。',
    tag: '免洗網底保養'
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
  // Sub-filter within the "耗材與保養" tab (假髮膠帶/膠片/膠水/卸膠/保養) — with dozens
  // of real consumable SKUs now in that one tab, a flat list is hard to browse.
  const [accessorySubFilter, setAccessorySubFilter] = useState<string>('all');
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
    if (activeFilter !== 'all' && p.category !== activeFilter) return false;
    if (activeFilter === 'accessories' && accessorySubFilter !== 'all' && p.categoryLabel !== accessorySubFilter) return false;
    return true;
  });

  // Sub-category pills shown only within the accessories tab, derived from
  // whatever categoryLabel values actually exist (so admin-added categories
  // show up automatically without needing another hardcoded list).
  const accessorySubCategories = Array.from(
    new Set(products.filter(p => p.category === 'accessories').map(p => p.categoryLabel))
  );

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
                onClick={() => { setActiveFilter(tab.id as any); setAccessorySubFilter('all'); }}
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

        {/* Accessories sub-filter — only relevant once inside 耗材與保養, which now
            holds many real consumable SKUs across several sub-categories. */}
        {activeFilter === 'accessories' && accessorySubCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 -mt-4 mb-8">
            <button
              onClick={() => setAccessorySubFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                accessorySubFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              全部類別
            </button>
            {accessorySubCategories.map(label => (
              <button
                key={label}
                onClick={() => setAccessorySubFilter(label)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  accessorySubFilter === label
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

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

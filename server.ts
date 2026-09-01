import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Vite's dev server auto-loads .env.local for the client, but this file runs
// outside Vite, so we load it ourselves for the AI 客服 key (.env as a
// fallback, then .env.local so it can override — mirrors Vite's own order).
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;

// Use the local project root directory so users can find, download, and inspect the database file easily.
const LOCAL_DB_PATH = path.join(process.cwd(), "blog.db");
const TEMP_DB_PATH = path.join(os.tmpdir(), "blog.db");

// Migrate actual data back to the workspace if it exists in safe mode to prevent data loss
if (fs.existsSync(TEMP_DB_PATH)) {
  try {
    fs.copyFileSync(TEMP_DB_PATH, LOCAL_DB_PATH);
    console.log("Successfully retrieved latest test data to workspace blog.db.");
  } catch (err) {
    console.error("Backward migration of database failed:", err);
  }
}

const DB_PATH = LOCAL_DB_PATH;

// Helper to guarantee DB state
interface DatabaseSchema {
  blogs: any[];
  categories: string[];
  reviews: any[];
  wigs: any[];
  siteContent?: Record<string, string>;
}

function initDB(): DatabaseSchema {
  const defaultCategories = ["最新消息", "案例分享", "主理人專欄", "知識分享", "活動與公告"];
  const defaultReviews: any[] = [];
  const defaultWigs: any[] = [
    // --- 女性假髮專區 (W.RICH 假髮專科標準) ---
    {
      id: "womens-topper-silk-base",
      type: "womens",
      title: "「頂部局部微增髮片」",
      category: "topper",
      categoryLabel: "頂部局部微髮片",
      baseMaterial: "silk-net",
      baseMaterialLabel: "雙層網底",
      priceType: "custom",
      tag: "頂部局部微增・3秒快扣",
      description: "參考 W.RICH 頂級工藝。專為解決女性頭頂扁塌、分線漸寬、頂部白髮及產後掉髮設計。採用高透氣立體雙層網底，純手工逐針單根勾織 100% Remy 優質真人少女健康髮，與原生髮天衣無縫自然揉合，一扣秒變蓬鬆高顱頂。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "100% 特優級 Remy 少女健康真髮，毛鱗片順滑不糾結",
        "專利微型親膚防滑夾扣，3 秒快穿、絕不扯原生髮",
        "雙層網底，近距離呈現天然毛囊頭皮血色感",
        "極輕透氣、全日佩戴無悶熱負擔"
      ],
      stylingTips: "可隨心電棒捲燙、吹風機吹整分線，洗後順著毛流吹乾即可維持豐盈立體度。",
      bestFit: "頭頂分線漸寬、產後或更年期頭頂稀疏、有白髮覆蓋需求、追求自然高顱頂的女性。",
      lifeSpan: "18 - 24 個月"
    },
    {
      id: "womens-topper-french-bangs",
      type: "womens",
      title: "「頂部微增髮片」韓系減齡空氣法式瀏海髮片 (French Airy Bangs Topper)",
      category: "topper",
      categoryLabel: "頂部局部微髮片",
      baseMaterial: "mono-net",
      baseMaterialLabel: "超細舒敏單絲網 (Mono-Net)",
      priceType: "ready",
      tag: "減齡修顏・法式空氣瀏海",
      description: "結合頭頂自然微增與韓系法式空氣瀏海。兩側羽化胎毛碎髮能完美修飾高顴骨、高額頭與 M 型髮際線，讓視覺年齡瞬間減齡 5-10 歲。",
      breathability: 5,
      durability: 4,
      naturalness: 5,
      features: [
        "100% 真人髮絲，可依個人臉型自由微調瀏海長度與弧度",
        "3D 弧形立體起拱底網，服貼前額頭骨不滑動",
        "超薄無感邊緣排勾，微風吹拂亦不露破綻",
        "免去頻繁修剪瀏海與化學染燙造成原生髮受損"
      ],
      stylingTips: "日常使用圓滾梳微帶 C 字弧度吹整，即可展現輕盈空氣感。",
      bestFit: "前額髮際線後退、額頭偏高、想嘗試瀏海又怕剪壞的原生髮女性。",
      lifeSpan: "12 - 18 個月"
    },
    {
      id: "womens-ready-salon-bob",
      type: "womens",
      title: "「穿戴型假髮」經典沙龍日系俐落鮑伯短髮 (Classic Salon Bob Full Wig)",
      category: "ready-to-wear",
      categoryLabel: "穿戴型真髮",
      baseMaterial: "silk-net",
      baseMaterialLabel: "3D 仿真大髮旋真蠶絲底網",
      priceType: "ready",
      tag: "經典日系・現貨即戴・修飾臉型",
      description: "W.RICH 風格經典穿戴型整頂真髮。立體內扣輪廓完美修飾臉型，頂部配置大面積仿真頭皮與手工大髮旋，可隨意切換旁分或中分。門市常備多款現貨，由專業髮型師現場修剪即可當日高雅帶走。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "100% 特優真人髮絲，光澤柔和自然，垂墜感極佳",
        "大面積 3D 仿真人工頭皮，俯視無死角如同原生生長",
        "全頭高彈性舒柔內網，附調節帶適應各種頭圍尺寸",
        "門市現貨 1 對 1 現場客製修剪，1 小時快速變身"
      ],
      stylingTips: "可使用平板夾在髮尾帶出俐落內扣或外翹造型，展現多變知性氣質。",
      bestFit: "希望快速變換短髮造型、全頭白髮不想頻繁染髮、或需短期出席重要場合的都會女性。",
      lifeSpan: "18 - 24 個月"
    },
    {
      id: "womens-ready-collarbone-wave",
      type: "womens",
      title: "「穿戴型假髮」溫柔日韓鎖骨層次微捲髮 (Gentle Layered Collarbone Wave)",
      category: "ready-to-wear",
      categoryLabel: "穿戴型真髮",
      baseMaterial: "silk-net",
      baseMaterialLabel: "超輕透氣彈性蠶絲網",
      priceType: "ready",
      tag: "黃金鎖骨線・溫柔減齡微捲",
      description: "長度落在迷人的鎖骨處，層次剪裁輕盈動感。嚴選優質真人髮絲，光澤柔和自然，配戴快速簡易，無論是放髮或隨意扎低馬尾都無比優雅。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "純手工排勾毛囊髮流，擺動極富彈性生命力",
        "親膚抗菌透氣內網，夏天配戴清爽不悶熱",
        "可耐 180 度高溫造型夾，任意變換捲度",
        "微型調節扣設計，牢固貼合不夾頭、不咬髮"
      ],
      stylingTips: "洗後抹上一滴護髮精油，用手輕抓髮尾微捲自然晾乾，即刻重現沙龍級光澤。",
      bestFit: "追求溫柔知性氣質、希望修飾肩頸與面部線條的精緻女性。",
      lifeSpan: "18 - 24 個月"
    },
    {
      id: "womens-bespoke-3d-full",
      type: "womens",
      title: "「客製型假髮」3D 頭型微雕量身訂製全頂假髮 (Bespoke 3D Tailored Full Wig)",
      category: "custom",
      categoryLabel: "客製型量身訂製",
      baseMaterial: "biomimetic-skin",
      baseMaterialLabel: "極薄透氣仿生膜 + 雙層絹絲 (Hybrid Skin)",
      priceType: "custom",
      tag: "1對1量模・30+髮色・運動不移位",
      description: "依據個人頭型、落髮邊界、骨相特徵進行 1:1 精密量模訂製。提供超過 30 種原生髮色精密對比，由資深職人一針一線勾織。服貼度如同第二層皮膚，劇烈運動、強風吹拂皆穩固安心。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "一對一精密量頭打模，完美貼合頭骨曲線",
        "100% 嚴選未燙染頂級少女原生真髮",
        "多種配戴方式可選（專利親膚微夾 / 醫療防敏感貼膠）",
        "享有完整的售後免費修剪調整與補髮保固"
      ],
      stylingTips: "完全比照自己的原生頭髮，可自由至沙龍洗髮、吹整、甚至挑染。",
      bestFit: "瀰漫性全頭落髮、追求極致無痕自然度與長期佩戴舒適性的女性。",
      lifeSpan: "24 - 36 個月"
    },
    {
      id: "womens-bespoke-luxury-long",
      type: "womens",
      title: "「客製型假髮」奢華海藻長捲真髮 (Luxury Bespoke Mermaid Waves)",
      category: "custom",
      categoryLabel: "客製型量身訂製",
      baseMaterial: "silk-net",
      baseMaterialLabel: "雙層網底",
      priceType: "custom",
      tag: "45cm+ 嚴選長髮・名媛氣場",
      description: "嚴選 45-50cm 超長優質 Remy 少女真髮絲，波浪優雅垂墜，髮量豐沛有光澤。結合職人手勾頂部毛孔技術，分線自由切換，完美詮釋高貴優雅風範。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "45cm+ 頂級特長真髮，無雜質、無分岔",
        "360 度立體高透氣網底，長髮亦能快速散熱排汗",
        "可做半丸子頭、法式編髮、晚宴盤髮等多元造型",
        "一對一專屬女性獨立 VIP 包廂諮詢，私密安心"
      ],
      stylingTips: "洗滌後使用寬齒木梳由髮尾輕柔往上梳通，定期使用護髮素滋養。",
      bestFit: "喜愛飄逸長捲髮、需出席社交宴會或希望大幅增加長髮豐盈度的女性。",
      lifeSpan: "20 - 30 個月"
    },
    {
      id: "womens-medical-silk-comfort",
      type: "womens",
      title: "「醫療級假髮」極柔防敏蠶絲全覆蓋醫療假髮 (Medical Grade Ultra-Soft Wig)",
      category: "medical",
      categoryLabel: "醫療化療專用",
      baseMaterial: "mono-net",
      baseMaterialLabel: "醫療舒敏雙層全蠶絲 (Medical Soft Silk)",
      priceType: "custom",
      tag: "零金屬・抗菌親膚・醫療補助發票",
      description: "專為化療療程、自體免疫全禿等極度敏感脆弱頭皮設計。全頂內襯採用無縫超柔天然蠶絲與抗菌棉柔面料，全無金屬夾扣，杜絕摩擦刺激。提供一對一獨立包廂免費剃頭陪伴與醫療補助開立。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      features: [
        "100% 天然純淨真髮，超輕量減壓設計",
        "無金屬、無硬梗，躺臥睡眠不壓迫頭皮",
        "高透氣抑菌防臭底網，減緩頭皮出汗泛紅",
        "提供正式醫療發票與合格證明，協助申請醫療補助"
      ],
      stylingTips: "配戴前可先套上附贈的純棉吸汗髮帽，保護極致脆弱頭皮。",
      bestFit: "化療中、癌症康復期、斑禿全禿或頭皮容易敏感泛紅的女性。",
      lifeSpan: "18 - 24 個月"
    },

    // --- 男士假髮專區 ---
    {
      id: "mens-classic-executive",
      type: "mens",
      title: "「頂級單層網・經典商務款」 (Classic Executive Single Mesh)",
      category: "hairline",
      categoryLabel: "髮際線款 (精準修飾)",
      baseMaterial: "lace",
      baseMaterialLabel: "單層網",
      priceType: "custom",
      tag: "前額無痕・精準髮際線",
      description: "專為著重前額與髮際線無痕過渡的型男設計。採用極致透氣的特供單層網底，髮流方向由職人純手工逐針針織，前額露出精確微雕髮際線，不分禿頂面積，大氣西裝頭首選。",
      breathability: 5,
      durability: 4,
      naturalness: 5,
      features: [
        "瑞士進口極薄無痕透氣網底",
        "精準微調原生毛髮旋向與髮流",
        "100% Remy 特優級真人髮絲",
        "前額可梳高，露出隱形微雕髮際線"
      ],
      stylingTips: "洗髮後用梳子在前心吹高定位，使用 Walker No-Shine 啞光隱形白膠貼牢，能完全露出前額且毫無痕跡。",
      bestFit: "需要露出前額，展現自信、幹練、富有生活尊榮感的髮友。",
      lifeSpan: "10 - 12 個月"
    },
    {
      id: "mens-korean-airy",
      type: "mens",
      title: "「韓系蓬鬆・微捲空氣感」 (K-Pop Volume Airy Wave)",
      category: "natural",
      categoryLabel: "自然款 (高自然度、雙層網底)",
      baseMaterial: "silk",
      baseMaterialLabel: "擬真蠶絲 (Silk Base)",
      priceType: "ready",
      tag: "逼真雙層網・天然毛囊頭皮",
      description: "當下最熱門的韓式空氣劉海與斜分微捲弧度。中心區使用雙層透氣蠶絲網底，帶有極高逼真度的手工針織毛囊陰影感，宛若頭皮天然生長出，蓬鬆百搭。",
      breathability: 4,
      durability: 5,
      naturalness: 5,
      features: [
        "雙層蠶絲高透真毛囊頭皮技術",
        "溫和輕度捲度烫針，隨時蓬鬆有型",
        "適合碎發劉海、中分/逗號劉海切換",
        "周邊細柔織邊，極高服貼防翹起"
      ],
      stylingTips: "吹乾時，可一邊用指腹推起髮根，一邊由下往上烘蓬。抹上極少許啞光髮乳或蓬蓬水，抓揉髮尾便可立體一整天。",
      bestFit: "多追求潮流髮型、不希望額頭露出的年輕落髮者與時尚髮友。",
      lifeSpan: "12 - 18 個月"
    },
    {
      id: "mens-ultra-skin",
      type: "mens",
      title: "「超薄隱形膜・無感極致款」 (Ultra-Thin Bio-Skin Second Gen)",
      category: "hairline",
      categoryLabel: "髮際線款 (精準修飾)",
      baseMaterial: "skin",
      baseMaterialLabel: "超薄PU生物膜 (Bio-Skin)",
      priceType: "custom",
      tag: "0.03mm超薄膜・露出額油頭首選",
      description: "厚度極薄至 0.03mm 的第二代親膚高耐用生物膜！與大腦頭皮厚度在物理層面完美貼合。前額進行了極其挑剔的「漸變短毛」羽化排勾，是追求大油頭、大背頭、敢於100%露額頭型男的究極之作。",
      breathability: 3,
      durability: 3,
      naturalness: 5,
      features: [
        "0.03mm 超薄羽量第二代高分子生物親膚膜",
        "360°露額無死角，大背頭、飛機頭皆能駕馭",
        "全無感真空貼合受重力，與肌膚同色同光",
        "純單針無結無痕勾發，宛若天生毛孔"
      ],
      stylingTips: "周邊推薦使用 Walker Max Hold 護膚底劑，前傾邊緣處用專業防水膠水刷塗一圈，用指腹壓實，完美防水且隨意梳高。",
      bestFit: "前額髮際線倒退、喜歡油頭西裝頭型男，且追求極致自然度與物理貼合感的品味男士。",
      lifeSpan: "5 - 7 個月"
    },
    {
      id: "mens-active-sport",
      type: "mens",
      title: "「極限運動・勁爽全透氣」 (Active Sport Extreme Ventilation)",
      category: "basic",
      categoryLabel: "基本款 (入門首選、單層網底)",
      baseMaterial: "lace",
      baseMaterialLabel: "單層網",
      priceType: "custom",
      tag: "耐汗全透氣・單層網",
      description: "特別針對酷愛激烈運動、容易大量流汗或重度戶外愛好者。選用進口強化單層微網底，具備最高級別的氣孔穿透速率。抗汗防水速乾能力一流。",
      breathability: 5,
      durability: 5,
      naturalness: 4,
      features: [
        "高張力高密度加固防撕裂編織微孔網底",
        "中高密頭髮覆蓋率，抗紫外線效果強",
        "耐水耐鹽分高規格處理特級真人髮絲",
        "清洗透氣效率比一般絹網高出 40%"
      ],
      stylingTips: "四周全貼 Walker Ultra Hold 藍帶或者 Super Tape 強效拉力貼。每隔 1-2 週可以自行卸除，直接沖水速乾清洗。",
      bestFit: "平時運動頻率高、重訓愛好者，或者是在外作業多、出汗量極大的髮友。",
      lifeSpan: "10 - 15 個月"
    },

    // --- 化療與醫療假髮 ---
    {
      id: "chemo-soft-silk-cap",
      type: "chemo",
      title: "「醫療低敏・極致真蠶絲全包覆」 (Medical Soft Silk Full Cap)",
      category: "silk-comfort",
      categoryLabel: "極緻蠶絲低防敏 (特柔親膚)",
      baseMaterial: "double",
      baseMaterialLabel: "雙層頂級桑蠶絲",
      priceType: "custom",
      tag: "全頭無金屬・親膚防摩擦",
      description: "專為放射治療、化學治療引起的落髮患者設計。全內襯採用醫用級無縫特柔桑蠶絲，不含任何金屬扣或硬塑料梗，給脆弱敏感頭皮最溫柔的保護。",
      breathability: 5,
      durability: 5,
      naturalness: 5,
      gentleness: 5,
      features: [
        "抗敏感無痕桑蠶絲親膚打底，零刺癢感",
        "純手工單針勾織真人 Remy 少女健康髮",
        "360度可調節親膚彈性帶，適應頭圍變化",
        "附開立正式醫療發票，支持申請醫療保險補助"
      ],
      stylingTips: "配戴前可先套上純棉吸汗髮帽，洗護使用中性無矽靈洗髮精溫水浸泡即可。",
      bestFit: "正在進行化療或放療、自體免疫全禿、頭皮極度敏感泛紅之人士。",
      lifeSpan: "18 - 24 個月"
    }
  ];

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      blogs: [],
      categories: defaultCategories,
      reviews: defaultReviews,
      wigs: defaultWigs,
      siteContent: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    let modified = false;
    if (!data.blogs) {
      data.blogs = [];
      modified = true;
    }
    if (!data.categories || data.categories.length === 0) {
      data.categories = defaultCategories;
      modified = true;
    }
    if (!data.reviews || data.reviews.length === 0) {
      data.reviews = defaultReviews;
      modified = true;
    }
    if (!data.wigs) {
      data.wigs = defaultWigs;
      modified = true;
    }
    if (!data.siteContent) {
      data.siteContent = {};
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    }
    return data;
  } catch (error) {
    console.error("Error reading database, resetting...", error);
    const fallback: DatabaseSchema = {
      blogs: [],
      categories: defaultCategories,
      reviews: defaultReviews,
      wigs: [],
      siteContent: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database...", error);
  }
}

// Ensure the db stands on startup
initDB();

// API Endpoints
app.get("/api/blogs", (req, res) => {
  const db = initDB();
  res.json(db.blogs);
});

// Upsert Blog Post (supports both REST post and Firestore setDoc style)
app.post("/api/blogs", (req, res) => {
  const db = initDB();
  const { id, title, content, category, excerpt, author, imgUrl, readTime, publishDate } = req.body;
  
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Missing required fields: title, content, or category" });
  }

  const targetId = id || Date.now().toString();
  const index = db.blogs.findIndex(b => b.id === targetId);

  const postData = {
    id: targetId,
    title,
    content,
    category,
    excerpt: excerpt || (content.replace(/[#*`\-]/g, '').slice(0, 100) + '...'),
    author: author || "大衛哥",
    publishDate: publishDate || new Date().toISOString().split('T')[0],
    readTime: readTime || "3 min",
    imgUrl: imgUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
  };

  if (index !== -1) {
    // Update existing
    db.blogs[index] = { ...db.blogs[index], ...postData };
  } else {
    // Insert new
    db.blogs.unshift(postData);
  }

  saveDB(db);
  res.status(201).json(postData);
});

app.put("/api/blogs/:id", (req, res) => {
  const db = initDB();
  const { id } = req.params;
  const { title, content, category, excerpt, author, imgUrl, readTime, publishDate } = req.body;

  const index = db.blogs.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Blog post not found" });
  }

  db.blogs[index] = {
    ...db.blogs[index],
    title: title ?? db.blogs[index].title,
    content: content ?? db.blogs[index].content,
    category: category ?? db.blogs[index].category,
    excerpt: excerpt ?? db.blogs[index].excerpt,
    author: author ?? db.blogs[index].author,
    imgUrl: imgUrl ?? db.blogs[index].imgUrl,
    readTime: readTime ?? db.blogs[index].readTime,
    publishDate: publishDate ?? db.blogs[index].publishDate
  };

  saveDB(db);
  res.json(db.blogs[index]);
});

app.delete("/api/blogs/:id", (req, res) => {
  const db = initDB();
  const { id } = req.params;

  const index = db.blogs.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Blog post not found" });
  }

  db.blogs.splice(index, 1);
  saveDB(db);
  res.json({ success: true });
});

// Categories Endpoints (upsert and delete supported)
app.get("/api/categories", (req, res) => {
  const db = initDB();
  res.json(db.categories);
});

app.post("/api/categories", (req, res) => {
  const db = initDB();
  const { id, name } = req.body;
  const categoryName = name || req.body.category;
  
  if (!categoryName) {
    return res.status(400).json({ error: "Missing category name" });
  }

  const clean = categoryName.trim();
  if (db.categories.some(c => c.toLowerCase() === clean.toLowerCase())) {
    return res.status(200).json(db.categories); // Safe exit if exists already
  }

  db.categories.push(clean);
  saveDB(db);
  res.status(201).json(db.categories);
});

app.delete("/api/categories", (req, res) => {
  const db = initDB();
  const { category } = req.body;
  
  if (!category) {
    return res.status(400).json({ error: "Missing category to delete" });
  }
  
  // Clean documents referencing category or set to default
  db.categories = db.categories.filter(c => c !== category);
  saveDB(db);
  res.json(db.categories);
});

// Reviews Endpoints
app.get("/api/reviews", (req, res) => {
  const db = initDB();
  res.json(db.reviews || []);
});

app.post("/api/reviews", (req, res) => {
  const db = initDB();
  const { id, authorName, authorEmail, rating, content, createdAt, isApproved } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: "Missing required fields: authorName or content" });
  }

  const targetId = id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const index = (db.reviews || []).findIndex(r => r.id === targetId);

  const reviewData = {
    id: targetId,
    authorName,
    authorEmail: authorEmail || "",
    rating: Number(rating) || 5,
    content,
    createdAt: createdAt || new Date().toISOString(),
    isApproved: isApproved !== undefined ? isApproved : true
  };

  if (!db.reviews) {
    db.reviews = [];
  }

  if (index !== -1) {
    db.reviews[index] = { ...db.reviews[index], ...reviewData };
  } else {
    db.reviews.unshift(reviewData);
  }

  saveDB(db);
  res.status(201).json(reviewData);
});

app.delete("/api/reviews/:id", (req, res) => {
  const db = initDB();
  const { id } = req.params;

  if (!db.reviews) {
    db.reviews = [];
  }

  const index = db.reviews.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }

  db.reviews.splice(index, 1);
  saveDB(db);
  res.json({ success: true });
});

// Wigs Catalog Endpoints
app.get("/api/wigs", (req, res) => {
  const db = initDB();
  res.json(db.wigs || []);
});

app.post("/api/wigs", (req, res) => {
  const db = initDB();
  const wig = req.body;
  if (!wig.title || !wig.type) {
    return res.status(400).json({ error: "Missing required fields: title or type" });
  }

  const targetId = wig.id || `wig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const index = (db.wigs || []).findIndex(w => w.id === targetId);

  const features = Array.isArray(wig.features) 
    ? wig.features 
    : (typeof wig.features === "string" ? wig.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : []);

  const wigData = {
    ...wig,
    id: targetId,
    features,
    breathability: Number(wig.breathability) || 5,
    durability: Number(wig.durability) || 5,
    naturalness: Number(wig.naturalness) || 5,
    gentleness: wig.gentleness ? (Number(wig.gentleness) || 5) : undefined,
  };

  if (!db.wigs) {
    db.wigs = [];
  }

  if (index !== -1) {
    db.wigs[index] = { ...db.wigs[index], ...wigData };
  } else {
    db.wigs.unshift(wigData);
  }

  saveDB(db);
  res.status(201).json(wigData);
});

app.delete("/api/wigs/:id", (req, res) => {
  const db = initDB();
  const { id } = req.params;

  if (!db.wigs) {
    db.wigs = [];
  }

  const rawId = id;
  const decodedId = decodeURIComponent(id);

  const index = db.wigs.findIndex(w => w.id === rawId || w.id === decodedId || w.title === rawId || w.title === decodedId);
  if (index === -1) {
    return res.status(404).json({ error: "Wig not found" });
  }

  db.wigs.splice(index, 1);
  saveDB(db);
  res.json({ success: true });
});

// Custom Site Content Persistence Endpoints (Frontend Direct Save)
app.get("/api/site-content", (req, res) => {
  const db = initDB();
  res.json(db.siteContent || {});
});

app.post("/api/site-content", (req, res) => {
  const db = initDB();
  const newContent = req.body;
  if (!db.siteContent) {
    db.siteContent = {};
  }
  db.siteContent = { ...db.siteContent, ...newContent };
  saveDB(db);
  res.json(db.siteContent);
});

// --- AI 客服 (Gemini) ---
// Knowledge base is loaded once at startup and reused for every request —
// reading the file per-request would add avoidable disk I/O to each reply.
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), "大衛假髮_AI特助訓練知識庫_v1.txt");
let knowledgeBase = "";
try {
  knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, "utf-8");
} catch (err) {
  console.warn("[AI Chat] Knowledge base file not found, AI 客服 will run without it:", err);
}

const SYSTEM_INSTRUCTION = `你是「大衛假髮 David Hair」網站上的 AI 客服「大衛哥AI特助」。請根據以下知識庫內容回答顧客問題。

規則：
- 用繁體中文回答，語氣溫暖、專業、簡潔（口語化，不要長篇大論，通常 2-4 句話內講完）。
- 只根據知識庫內容回答；知識庫沒提到的資訊（例如確切庫存、個人化診斷、醫療建議）就誠實說不清楚，並引導對方加 LINE (@davidhair) 或撥打 0909-056-036 由真人顧問協助。
- 不要編造價格、療效或門市沒有的服務。
- 適時引導顧客加入官方 LINE 預約諮詢。

知識庫：
${knowledgeBase}`;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Streams the reply back as plain chunked text so the browser can render it
// token-by-token instead of waiting for the full response — this is what
// makes the chat feel fast even though total generation time is unchanged.
app.post("/api/chat", async (req, res) => {
  if (!genAI) {
    res.status(503).json({
      error: "AI 客服尚未設定金鑰，請於 .env.local 加入 GEMINI_API_KEY 後重啟伺服器。",
    });
    return;
  }

  const { message, history } = req.body as {
    message?: string;
    history?: { role: "user" | "model"; text: string }[];
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  // Only keep the last few turns — a shorter prompt sends/processes faster
  // and customer-service context rarely needs more than that anyway.
  const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
  const contents = [
    ...recentHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no"); // disable proxy buffering, if any

  // NOTE: this listens on `res` (the response stream), not `req`. Express's
  // body parser fully consumes/ends the request stream before this handler
  // even runs, which makes a plain readable stream emit its own 'close' —
  // so `req.on('close', ...)` fires immediately on every request and aborts
  // the Gemini call before it starts. `res` only closes on a real client
  // disconnect, which is what we actually want to detect here.
  const abortController = new AbortController();
  res.on("close", () => abortController.abort());

  try {
    const stream = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Flash's "thinking" step adds latency the customer can feel; this
        // is a simple Q&A task that doesn't need multi-step reasoning.
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 500,
        abortSignal: abortController.signal,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    res.end();
  } catch (err: any) {
    if (abortController.signal.aborted) {
      // Client navigated away / closed the chat — nothing to send back.
      return;
    }
    console.error("[AI Chat] Gemini request failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI 客服暫時無法回應，請稍後再試或直接加 LINE 詢問。" });
    } else {
      res.end("\n\n（抱歉，回覆中斷了，請重新發送一次或直接加 LINE 詢問 🙏）");
    }
  }
});

// Helper to generate a smart tag dynamically based on the title of the product
function generateSmartTag(title: string): string {
  const t = (title || "").toUpperCase();
  
  // 1. Detect Brand & Origin
  let brand = "大衛嚴選";
  if (t.includes("WALKER TAPE") || t.includes("WALKER")) {
    brand = "美國 Walker Tape";
  } else if (t.includes("C-22") || t.includes("CITRUS") || t.includes("C22")) {
    brand = "美國 C-22";
  } else if (t.includes("ULTRA HOLD")) {
    brand = "美國 Ultra Hold";
  } else if (t.includes("SENSITAK") || t.includes("SENSI-TAK")) {
    brand = "美國 Sensi-Tak";
  } else if (t.includes("GHOST BOND")) {
    brand = "Ghost Bond";
  } else if (t.includes("大衛") || t.includes("DAVID")) {
    brand = "大衛推薦";
  }

  // 2. Detect Product Type & Specifications
  let type = "頂級配品";
  if (t.includes("36碼") || t.includes("36Y") || t.includes("36 YARDS")) {
    type = "36碼旗艦裝";
  } else if (t.includes("12碼") || t.includes("12Y") || t.includes("12 YARDS")) {
    type = "12碼實惠經濟裝";
  } else if (t.includes("3碼") || t.includes("3Y") || t.includes("3 YARDS")) {
    type = "3碼攜帶體驗裝";
  } else if (t.includes("膠帶") || t.includes("雙面膠")) {
    type = "專用雙面膠帶";
  } else if (t.includes("除膠") || t.includes("REMOVER") || t.includes("卸")) {
    type = "專業高效除膠劑";
  } else if (t.includes("頭皮") || t.includes("PROTECTOR") || t.includes("保護")) {
    type = "防致敏頭皮保護液";
  } else if (t.includes("鋼夾") || t.includes("扣子") || t.includes("夾子") || t.includes("CLIP")) {
    type = "高彈防滑原廠鋼夾";
  } else if (t.includes("膠水") || t.includes("黏著劑") || t.includes("GLUE")) {
    type = "防水防汗專用膠水";
  } else if (t.includes("假髮") || t.includes("髮片") || t.includes("補髮")) {
    type = "精工補髮大師髮片";
  }

  return `${brand} • ${type}`;
}

// Import product details from external URL
app.get("/api/import-product", async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    let finalUrl = targetUrl;
    let isCategory = false;

    // Fetch initial HTML
    const initialRes = await fetch(finalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!initialRes.ok) {
      throw new Error(`Failed to fetch initial page: ${initialRes.statusText}`);
    }

    let html = await initialRes.text();

    // Check if it is a category/list page by checking if productId is absent and we have product detail links
    if (!finalUrl.includes("productId=") && (finalUrl.includes("Product?") || finalUrl.includes("cateId="))) {
      const detailUrlMatch = html.match(/(ProductDetail\?key=[^"'>]+&amp;productId=\d+)/i)
        || html.match(/(ProductDetail\?key=[^"'>]+&productId=\d+)/i);
      if (detailUrlMatch) {
        isCategory = true;
        const relativePath = detailUrlMatch[1].replace(/&amp;/g, "&");
        const parsedUrl = new URL(finalUrl);
        finalUrl = `${parsedUrl.protocol}//${parsedUrl.host}/h/${relativePath}`;

        // Fetch actual detail page HTML
        const detailRes = await fetch(finalUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
          },
          signal: AbortSignal.timeout(6000)
        });
        if (detailRes.ok) {
          html = await detailRes.text();
        }
      }
    }

    // Now, we have finalUrl (which is a product detail page) and its html.
    const getMetaProperty = (prop: string) => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i");
      const match = html.match(regex);
      if (match) return match[1];
      const revRegex = new RegExp(`<meta[^]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
      const revMatch = html.match(revRegex);
      return revMatch ? revMatch[1] : "";
    };

    let title = getMetaProperty("og:title") || getMetaProperty("twitter:title");
    let image = getMetaProperty("og:image") || getMetaProperty("twitter:image");
    let description = getMetaProperty("og:description") || getMetaProperty("twitter:description");

    if (!title) {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : "";
    }

    if (image && image.startsWith("/")) {
      try {
        const parsedUrl = new URL(finalUrl);
        image = `${parsedUrl.protocol}//${parsedUrl.host}${image}`;
      } catch (e) {
        // ignore
      }
    }

    if (!image) {
      image = "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600";
    }

    if (!description) {
      description = "大衛哥嚴選優質商品，為您的髮片提供全方位的頂級防護與保養。本產品為原廠官方正品，安全防敏，配戴極致牢固舒適。";
    }

    // Parse options recursively from getPrdOptData
    const productIdMatch = finalUrl.match(/productId=(\d+)/i);
    const productId = productIdMatch ? productIdMatch[1] : "";

    let price = 0;
    let priceMax: number | undefined = undefined;
    let customOptions: any[] = [];

    // Helper: Parse JSON options defensively from the platform's response
    function parseJSONOptions(data: any): { value: string, label: string }[] {
      if (!data) return [];
      if (Array.isArray(data)) {
        return data.map(item => {
          if (typeof item === "string" || typeof item === "number") {
            const str = String(item).trim();
            return { value: str, label: str };
          }
          if (item && typeof item === "object") {
            const value = String(item.value ?? item.id ?? item.code ?? item.val ?? item.key ?? "").trim();
            const label = String(item.text ?? item.label ?? item.name ?? item.title ?? item.optName ?? value ?? "").trim();
            return { value, label };
          }
          return null;
        }).filter((x): x is { value: string, label: string } => !!x && x.value !== "");
      }
      if (typeof data === "object") {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            const parsed = parseJSONOptions(data[key]);
            if (parsed.length > 0) return parsed;
          }
        }
      }
      return [];
    }

    // 1. Robust JSON-LD Structured Data Parsing
    try {
      const jsonLdMatches = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig);
      for (const m of jsonLdMatches) {
        try {
          const cleanJsonStr = m[1].trim().replace(/^\s*\/\/<!\[CDATA\[|\]\]>\s*$/g, "");
          const parsed = JSON.parse(cleanJsonStr);
          
          const processProduct = (obj: any) => {
            if (!obj) return;
            if (obj["@type"] === "Product" || obj["@type"] === "IndividualProduct" || obj.name || obj.offers) {
              if (obj.name && !title) title = obj.name;
              if (obj.description && (!description || description.length < 50)) description = obj.description;
              if (obj.image) {
                const img = Array.isArray(obj.image) ? obj.image[0] : obj.image;
                if (img && typeof img === "string") image = img;
              }
              
              if (obj.offers) {
                const offers = obj.offers;
                if (Array.isArray(offers)) {
                  const firstOffer = offers[0];
                  if (firstOffer && firstOffer.price) {
                    const parsedPrice = parseFloat(String(firstOffer.price).replace(/,/g, ""));
                    if (parsedPrice > 0) price = parsedPrice;
                  }
                } else if (typeof offers === "object") {
                  if (offers.price) {
                    const parsedPrice = parseFloat(String(offers.price).replace(/,/g, ""));
                    if (parsedPrice > 0) price = parsedPrice;
                  }
                  if (offers.lowPrice) {
                    const parsedLow = parseFloat(String(offers.lowPrice).replace(/,/g, ""));
                    if (parsedLow > 0) price = parsedLow;
                  }
                  if (offers.highPrice) {
                    const parsedHigh = parseFloat(String(offers.highPrice).replace(/,/g, ""));
                    if (parsedHigh > 0) priceMax = parsedHigh;
                  }
                }
              }
            }
          };
          
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              processProduct(item);
            }
          } else if (typeof parsed === "object") {
            processProduct(parsed);
            if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
              for (const item of parsed["@graph"]) {
                processProduct(item);
              }
            }
          }
        } catch (e) {
          // ignore individual block failures
        }
      }
    } catch (e) {
      console.error("JSON-LD parsing failed:", e);
    }

    // 2. Standard Meta Tag / Regex Price Fallback
    if (price === 0) {
      const priceMeta = getMetaProperty("product:price:amount") || getMetaProperty("price") || getMetaProperty("product:price");
      if (priceMeta) {
        price = parseFloat(priceMeta) || 0;
      }
    }

    if (price === 0) {
      const priceRegexes = [
        /id=["']prdPrice["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,]+)/i,
        /class=["']prdPrice["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,]+)/i,
        /class=["']new-price[^"']*["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,.-]+)/i,
        /class=["']special-price[^"']*["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,.-]+)/i,
        /class=["']sale-price[^"']*["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,.-]+)/i,
        /class=["']member-price[^"']*["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,.-]+)/i,
        /NT\$\s*([\d,]+)/i,
        /售價\s*[:：]\s*[\$NS]*\s*([\d,]+)/i,
        /價格\s*[:：]\s*[\$NS]*\s*([\d,]+)/i,
        /特價\s*[:：]\s*[\$NS]*\s*([\d,]+)/i,
        /網路價\s*[:：]\s*[\$NS]*\s*([\d,]+)/i,
        /["']price["'][^>]*>\s*(?:NT\$|NT|\$)?\s*([\d,]+)/i
      ];
      for (const rx of priceRegexes) {
        const match = html.match(rx);
        if (match) {
          const rawPrice = match[1].replace(/,/g, "").replace(/\$/g, "").trim();
          if (rawPrice.includes("-")) {
            const parts = rawPrice.split("-").map(p => parseInt(p.trim(), 10));
            price = parts[0] || 0;
            priceMax = parts[1];
          } else {
            price = parseInt(rawPrice, 10) || 0;
          }
          if (price > 0) break;
        }
      }
    }

    // Map to store raw value to friendly name translation (e.g. "124" -> "紅膠")
    const valueToLabelMap: Record<string, string> = {};

    if (productId) {
      const parsedUrl = new URL(finalUrl);
      const postUrl = `${parsedUrl.protocol}//${parsedUrl.host}/h/getPrdOptData`;

      // 3. Extract Level 1 option values from the page
      let level1SelectContent = "";
      const selectMatches = html.matchAll(/<select([^>]*)>([\s\S]*?)<\/select>/ig);
      for (const sm of selectMatches) {
        const attrs = sm[1];
        const content = sm[2];
        if (attrs.includes("prdOptLevel1") || attrs.includes("Level1") || attrs.includes("level-1") || attrs.includes("level1")) {
          level1SelectContent = content;
          break;
        }
      }
      if (!level1SelectContent) {
        // Fallback: take the first select on the page that has options
        for (const sm of html.matchAll(/<select([^>]*)>([\s\S]*?)<\/select>/ig)) {
          if (sm[2].includes("<option") && !sm[1].includes("quantity") && !sm[1].includes("qty") && !sm[1].includes("count")) {
            level1SelectContent = sm[2];
            break;
          }
        }
      }

      const level1Parsed: { value: string, label: string }[] = [];
      if (level1SelectContent) {
        const optionRegex = /<option\s+value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/ig;
        let optMatch;
        while ((optMatch = optionRegex.exec(level1SelectContent)) !== null) {
          const val = optMatch[1].trim();
          const label = optMatch[2].replace(/<[^>]+>/g, "").trim();
          if (val && !val.includes("種類") && !val.includes("請選擇") && !val.includes("寬度") && !val.includes("長度") &&
              !label.includes("請選擇") && !label.includes("選擇")) {
            level1Parsed.push({ value: val, label });
            valueToLabelMap[val] = label;
          }
        }
      }

      // If we have parsed Level 1 options, crawl combinations recursively up to 3 levels
      if (level1Parsed.length > 0) {
        const combinations: { path: string[], price: number }[] = [];

        for (const opt1 of level1Parsed) {
          try {
            const res2 = await fetch(postUrl, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `productId=${productId}&value=${encodeURIComponent(opt1.value)}&level=1`,
              signal: AbortSignal.timeout(4000)
            });
            if (res2.ok) {
              const res2Data = await res2.json();
              const level2Parsed = parseJSONOptions(res2Data);
              
              if (level2Parsed.length > 0) {
                for (const opt2 of level2Parsed) {
                  valueToLabelMap[opt2.value] = opt2.label;
                  
                  const res3 = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `productId=${productId}&value=${encodeURIComponent(opt1.value + "|" + opt2.value)}&level=2`,
                    signal: AbortSignal.timeout(4000)
                  });
                  if (res3.ok) {
                    const res3Data = await res3.json();
                    const level3Parsed = parseJSONOptions(res3Data);
                    
                    if (level3Parsed.length > 0) {
                      for (const opt3 of level3Parsed) {
                        valueToLabelMap[opt3.value] = opt3.label;
                        
                        const res4 = await fetch(postUrl, {
                          method: "POST",
                          headers: { "Content-Type": "application/x-www-form-urlencoded" },
                          body: `productId=${productId}&value=${encodeURIComponent(opt1.value + "|" + opt2.value + "|" + opt3.value)}&level=3`,
                          signal: AbortSignal.timeout(4000)
                        });
                        if (res4.ok) {
                          const data: any = await res4.json();
                          const resPrice = data ? (data.price ?? data.memberPrice ?? data.salePrice ?? data.value) : null;
                          if (resPrice !== undefined && resPrice !== null) {
                            combinations.push({
                              path: [opt1.value, opt2.value, opt3.value],
                              price: Number(resPrice)
                            });
                          }
                        }
                      }
                    } else {
                      // Only 2 levels. Fetch price with level 2 as leaf
                      const resLeaf = await fetch(postUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `productId=${productId}&value=${encodeURIComponent(opt1.value + "|" + opt2.value)}&level=2`,
                        signal: AbortSignal.timeout(4000)
                      });
                      if (resLeaf.ok) {
                        const data: any = await resLeaf.json();
                        const resPrice = data ? (data.price ?? data.memberPrice ?? data.salePrice ?? data.value) : null;
                        if (resPrice !== undefined && resPrice !== null) {
                          combinations.push({
                            path: [opt1.value, opt2.value],
                            price: Number(resPrice)
                          });
                        }
                      }
                    }
                  }
                }
              } else {
                // Only 1 level. Fetch price with level 1 as leaf
                const resLeaf = await fetch(postUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: `productId=${productId}&value=${encodeURIComponent(opt1.value)}&level=1`,
                  signal: AbortSignal.timeout(4000)
                });
                if (resLeaf.ok) {
                  const data: any = await resLeaf.json();
                  const resPrice = data ? (data.price ?? data.memberPrice ?? data.salePrice ?? data.value) : null;
                  if (resPrice !== undefined && resPrice !== null) {
                    combinations.push({
                      path: [opt1.value],
                      price: Number(resPrice)
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Failed to crawl combination for opt1=${opt1.value}`, e);
          }
        }

        // If we successfully fetched combinations, solve prices and option price modifiers
        if (combinations.length > 0) {
          const uniqueChoices1 = Array.from(new Set(combinations.map(c => c.path[0])));
          const uniqueChoices2 = Array.from(new Set(combinations.map(c => c.path[1]).filter(Boolean)));
          const uniqueChoices3 = Array.from(new Set(combinations.map(c => c.path[2]).filter(Boolean)));

          // Find lowest and highest pricing
          const minCombo = combinations.reduce((prev, curr) => curr.price < prev.price ? curr : prev, combinations[0]);
          const maxCombo = combinations.reduce((prev, curr) => curr.price > prev.price ? curr : prev, combinations[0]);

          price = minCombo.price;
          priceMax = maxCombo.price;

          const base1 = minCombo.path[0];
          const base2 = minCombo.path[1];
          const base3 = minCombo.path[2];

          // Extract option labels (e.g. "種類", "寬度", "長度")
          const optNames: string[] = [];
          const hiddenOptRegex = /<option[^>]*class=["'](?:[^"']*optContHidden[^"']*|prdOptTitle|opt-title)[^"']*["'][^>]*>([^<]+)<\/option>/ig;
          let nameMatch;
          while ((nameMatch = hiddenOptRegex.exec(html)) !== null) {
            optNames.push(nameMatch[1].trim());
          }
          if (optNames.length === 0) {
            // Fallback matching classes
            const titleMatches = html.matchAll(/class=["'][^"']*(?:prdOptTitle|opt-title|spec-title|option-title|optTitle)[^"']*["'][^>]*>([^<]+)/ig);
            for (const tm of titleMatches) {
              optNames.push(tm[1].trim());
            }
          }
          if (optNames.length < 1) optNames.push("種類");
          if (optNames.length < 2) optNames.push("寬度");
          if (optNames.length < 3) optNames.push("長度");

          const getModifier1 = (c1: string) => {
            if (c1 === base1) return 0;
            const match = combinations.find(c => c.path[0] === c1 && c.path[1] === base2 && c.path[2] === base3);
            if (match) return match.price - price;
            const anyMatch = combinations.find(c => c.path[0] === c1);
            return anyMatch ? anyMatch.price - price : 0;
          };

          const getModifier2 = (c2: string) => {
            if (c2 === base2) return 0;
            const match = combinations.find(c => c.path[0] === base1 && c.path[1] === c2 && c.path[2] === base3);
            if (match) return match.price - price;
            const anyMatch = combinations.find(c => c.path[1] === c2);
            return anyMatch ? anyMatch.price - price : 0;
          };

          const getModifier3 = (c3: string) => {
            if (c3 === base3) return 0;
            const match = combinations.find(c => c.path[0] === base1 && c.path[1] === base2 && c.path[2] === c3);
            if (match) return match.price - price;
            const anyMatch = combinations.find(c => c.path[2] === c3);
            return anyMatch ? anyMatch.price - price : 0;
          };

          if (uniqueChoices1.length > 0) {
            customOptions.push({
              name: optNames[0],
              choices: uniqueChoices1.map(c => ({
                label: valueToLabelMap[c] || c,
                priceModifier: getModifier1(c)
              }))
            });
          }
          if (uniqueChoices2.length > 0) {
            customOptions.push({
              name: optNames[1],
              choices: uniqueChoices2.map(c => ({
                label: valueToLabelMap[c] || c,
                priceModifier: getModifier2(c)
              }))
            });
          }
          if (uniqueChoices3.length > 0) {
            customOptions.push({
              name: optNames[2],
              choices: uniqueChoices3.map(c => ({
                label: valueToLabelMap[c] || c,
                priceModifier: getModifier3(c)
              }))
            });
          }
        }
      }
    }

    // 4. Fallback Static HTML Select Option Extractor
    if (customOptions.length === 0) {
      const selectMatches = html.matchAll(/<select([^>]*)>([\s\S]*?)<\/select>/ig);
      let selectCount = 0;
      for (const sm of selectMatches) {
        const attrs = sm[1];
        const content = sm[2];
        
        if (attrs.includes("qty") || attrs.includes("quantity") || attrs.includes("count") || attrs.includes("shipping") || attrs.includes("store")) {
          continue;
        }
        
        const optReg = /<option\s+value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/ig;
        let oMatch;
        const choices: { label: string, priceModifier: number }[] = [];
        while ((oMatch = optReg.exec(content)) !== null) {
          const val = oMatch[1].trim();
          const label = oMatch[2].replace(/<[^>]+>/g, "").trim();
          if (val && !val.includes("種類") && !val.includes("請選擇") && !val.includes("選擇") && !label.includes("請選擇")) {
            let priceModifier = 0;
            const priceModMatch = label.match(/\+?\s*NT\$\s*([\d,]+)/i) || label.match(/\+\s*([\d,]+)/i);
            if (priceModMatch) {
              priceModifier = parseInt(priceModMatch[1].replace(/,/g, ""), 10);
            }
            const cleanLabel = label.replace(/\s*\(.*?\)/g, "").replace(/\s*\+.*?$/g, "").trim();
            choices.push({ label: cleanLabel, priceModifier });
          }
        }
        
        if (choices.length > 0) {
          let optName = `規格 ${selectCount + 1}`;
          const nameAttr = attrs.match(/name=["']([^"']+)["']/i) || attrs.match(/id=["']([^"']+)["']/i) || attrs.match(/data-label=["']([^"']+)["']/i);
          if (nameAttr) {
            const rawName = nameAttr[1].toLowerCase();
            if (rawName.includes("color") || rawName.includes("顏色") || rawName.includes("色")) optName = "顏色";
            else if (rawName.includes("size") || rawName.includes("尺寸") || rawName.includes("規格")) optName = "尺寸";
            else if (rawName.includes("type") || rawName.includes("種類") || rawName.includes("型")) optName = "種類";
            else optName = nameAttr[1];
          }
          
          customOptions.push({
            name: optName,
            choices
          });
          selectCount++;
          if (selectCount >= 3) break;
        }
      }
    }

    if (price === 0) {
      price = 350;
    }

    res.json({
      title,
      price,
      priceMax,
      imgUrl: image,
      description,
      customOptions: customOptions.length > 0 ? customOptions : undefined,
      tag: generateSmartTag(title),
      category: "accessories",
      categoryLabel: "頂級耗材配品"
    });

  } catch (error: any) {
    console.error("Scraper failed or timed out, using fallback:", error);
    
    // Fallback logic
    let title = "美國原廠 Walker Tape 雙面膠帶";
    let price = 350;
    let priceMax = 1200;
    let imgUrl = "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600";
    let description = "美國進口假髮專用膠帶大廠 Walker Tape 官方正品。提供多種膠帶款式（紅膠、白膠、紫膠、藍膠、綠膠、No-Shine 無光澤），以及多種常用寬度與長度規格。";
    
    res.json({
      title,
      price,
      priceMax,
      imgUrl,
      description,
      tag: generateSmartTag(title),
      category: "accessories",
      categoryLabel: "頂級耗材配品"
    });
  }
});

// Start express application with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Disable Hot Module Replacement connection over websocket completely
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[David Hair Server] running on http://localhost:${PORT}`);
  });
}

startServer();

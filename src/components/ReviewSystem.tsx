import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  ZoomIn, 
  Heart, 
  Sparkles, 
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  imgUrl: string;
  tags: string[];
  comments: string[];
}

export default function ReviewSystem() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const feedbackItems: FeedbackItem[] = [
    {
      id: 'customer-feedback-1',
      title: '實際配戴滿意度調查',
      description: '大衛假髮客戶配戴後滿意回饋一覽。高達 98% 的客戶反饋表示真人手鉤織網底輕盈透氣、不悶熱，髮流自然，完美解決頂部稀疏 or 白髮困擾，出門更有自信。',
      imgUrl: '/images/客戶評價1.png',
      tags: ['滿意回饋', '真人髮絲', '無痛配戴', '自然無痕'],
      comments: [
        '「朋友都說我看起來變年輕了，完全看不出是戴假髮！」',
        '「手鉤織的真的非常透氣，夏天戴著運動也完全不悶熱。」',
        '「諮詢到訂製過程非常專業，大衛哥很有耐心的解答所有問題。」'
      ]
    },
    {
      id: 'customer-feedback-3',
      title: '客製化白髮與髮流細節反饋',
      description: '大衛哥獨家量模訂製技術，支援在全真人髮中客製比例的白髮絲、特定的頭旋位置與髮流方向。不論是局部稀疏、挑染需求，或是高難度的抗敏配戴，都能手工精心織造出 100% 自然的魔髮極限。',
      imgUrl: '/images/客戶評價2.png',
      tags: ['客製白髮', '純手工鉤織', '極致自然', '頭旋髮流'],
      comments: [
        '「客製了 10% 的白髮，收到時跟我的真髮完全無縫接軌，太神奇了！」',
        '「終於找到可以指定頭旋方向的髮片，髮流梳起來跟自己的一模一樣。」',
        '「大衛哥的工藝真的沒話說，親膚貼合度與透氣感完全對得起這個誠心價格！」'
      ]
    },
    {
      id: 'customer-feedback-4',
      title: '全方位客製與自然髮際線反饋',
      description: '來自資深髮友的真實肯定。手工高解析隱形網底，完美重塑前額與頂部髮際線。不論是日常洗剪、定型，或是各種強風與運動環境，都能帶來不可思議的透氣與貼合牢固感，完全看不出破綻。',
      imgUrl: '/images/客戶評價3.png',
      tags: ['隱形髮際線', '透氣舒適', '牢不可分', '自信重現'],
      comments: [
        '「出門騎車戴安全帽拿下來，頭髮隨手撥一撥就很自然，完全不怕掉！」',
        '「假髮最怕邊緣露出來，但大衛哥做的髮際線非常薄透自然，剪短劉海也OK。」',
        '「穿戴和保養都教得很詳細，售後服務一級棒，真的讓人很安心。」'
      ]
    },
    {
      id: 'customer-feedback-5',
      title: '運動大汗淋漓配戴實測反饋',
      description: '由熱愛運動與戶外健身的髮友帶來的實際反饋。大衛假髮採用進口超薄親膚醫療級蠶絲網底，極致透氣與快速排汗。不論是長跑、重訓，還是炎夏大汗洗禮，都能維持安全卓越的黏貼及固定性能，極具實用性。',
      imgUrl: '/images/客戶評價4.png',
      tags: ['高透氣排汗', '強效固定', '運動實測', '無感舒適'],
      comments: [
        '「以前戴它牌跑 5 公里就悶到想拆，大衛假髮真的完全不會，透氣滿分！」',
        '「劇烈運動也不必害怕移位，完全感受不到膠片鬆脫的危機，太有安全感了！」',
        '「清潔非常容易，水洗後晾乾依然柔順自然，這工藝真的超乎期待。」'
      ]
    },
    {
      id: 'customer-feedback-6',
      title: '一對一專屬隱密空間諮詢感受',
      description: '大衛哥極致注重顧客隱私與諮詢品質。全預約制一對一門市服務，不強迫推銷不層層加價。親自為每位髮友解說毛囊學與打版編織原理，讓假髮訂製真正能感到無壓、親切與尊榮。',
      imgUrl: '/images/客戶評價6.jpg',
      tags: ['隱私奢華包廂', '一對一親切服務', '無壓諮詢', '誠信透明'],
      comments: [
        '「第一次諮詢超緊張，但一對一包廂隱密性極高，大衛哥人很有耐心解答我所有問題。」',
        '「完全沒有被推銷的強迫感，價格像網路上寫的一樣只有 26000 均一，太安心了。」',
        '「大衛哥親自量規格和介紹，像朋友一樣聊天，真的很推薦正在猶豫的人！」'
      ]
    }
  ];

  return (
    <div id="customer-reviews-section" className="py-20 bg-zinc-50 border-t border-zinc-100 relative overflow-hidden font-sans">
      {/* Background elegant decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-600 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-brand-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 fill-brand-500/30" />
            <span>真誠反饋 • 口碑見證</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight"
          >
            髮友配戴<span className="text-brand-500">真實口碑說明</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-zinc-600 text-sm leading-relaxed"
          >
            大衛假髮堅持「全真人手鉤織、固定均一價」，免除複雜的推銷與計價。
            以下為顧客實際配戴後的心得與回饋圖片，點擊圖片可放大閱讀詳細記錄。
          </motion.p>
        </div>

        {/* Major Visual Feedback Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">
          {feedbackItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white rounded-3xl border border-zinc-100 hover:border-brand-500/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              style={{
                transform: hoveredCard === item.id ? 'translateY(-4px)' : 'none'
              }}
            >
              {/* Product Review Image & Interactive zoom button */}
              <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden group">
                <img loading="lazy" decoding="async" 
                  src={item.imgUrl} 
                  alt={item.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setSelectedImage(item.imgUrl)}
                />
                
                {/* Visual Glass Overlay on Hover */}
                <div 
                  onClick={() => setSelectedImage(item.imgUrl)}
                  className="absolute inset-0 bg-stone-900/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center cursor-pointer text-white gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-zinc-950 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold tracking-wider">點擊放大檢視</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-brand-500 flex items-center gap-1 shadow-md border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
                  <span className="text-xs font-black tracking-widest text-white">5.0</span>
                  <span className="text-zinc-400 text-[10px] ml-0.5">極致好評</span>
                </div>
              </div>

              {/* Text explanations and quotes */}
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[11px] font-semibold tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-zinc-950 flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-brand-500" />
                  {item.title}
                </h3>

                <p className="text-zinc-600 text-xs leading-relaxed mb-6 font-medium">
                  {item.description}
                </p>

                {/* Styled quotes inside item */}
                <div className="mt-auto space-y-3 pt-6 border-t border-zinc-100">
                  <h4 className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase mb-1">精選髮友口碑真實引述</h4>
                  {item.comments.map((comment, cIdx) => (
                    <div key={cIdx} className="flex gap-2.5 items-start pl-2 border-l-2 border-brand-500/40">
                      <Heart className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-1 fill-brand-500/20" />
                      <p className="text-zinc-800 text-xs font-semibold leading-relaxed italic">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Supporting Service Commitment Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-8 md:p-10 bg-brand-900 text-white rounded-3xl relative overflow-hidden shadow-lg border border-brand-600/20"
        >
          {/* Subtle logo vector outline for luxury branding */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-white/[0.03] pointer-events-none">
            <Sparkles className="w-72 h-72 fill-current" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
            <div className="lg:w-2/3 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-brand-100">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>大衛假髮誠信宣言 • 真人真圖</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight font-sans">
                為什麼眾多髮友誠心推薦大衛哥？
              </h3>
              <p className="text-brand-100/85 text-xs leading-relaxed max-w-2xl font-light">
                許多店家打著「幾千元起」的廣告吸客，到店量身後卻變成數萬甚至十幾萬元。
                大衛不屑玩弄這樣的數字遊戲，我們始終堅持<strong>不分面積均一價 26,000 元</strong>。
                全真人高級髮絲，純手工精心鉤織，並提供客製化色澤與髮流方向。真實的好評，經得起每位挑剔髮友的親身實貼驗證！
              </p>
            </div>
            
            <div className="lg:w-1/3 w-full grid grid-cols-1 gap-3.5">
              <div className="flex items-center gap-3 bg-white/[0.07] px-4 py-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-sm font-black text-white">全真人頂級真髮手工編織</span>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.07] px-4 py-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-sm font-black text-brand-400">不分尺寸大小 均一價 NT$ 26,000</span>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.07] px-4 py-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-sm font-black text-white">高隱形度，不悶不熱完美融合</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Lightbox / Enlarged modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10 shadow-lg z-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image display */}
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-1 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img loading="lazy" decoding="async" 
                src={selectedImage} 
                alt="顧客評價放大圖" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="py-2.5 px-4 text-center border-t border-white/5 bg-zinc-900/60 mt-1">
                <p className="text-zinc-400 text-xs font-medium">大衛假髮顧客配戴心得真實紀錄 • 點擊背景任意處可關閉</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

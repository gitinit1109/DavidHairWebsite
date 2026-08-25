import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, MapPin, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function HairTroubleBanner() {
  const bubbles = [
    { text: '髮線倒退', icon: 'm-shape', type: 'dark', delay: 0 },
    { text: '局部禿 / 全禿', icon: 'patch', type: 'light', delay: 0.1 },
    { text: '遺傳雄性禿', icon: 'genetics', type: 'dark', delay: 0.2 },
    { text: '髮量稀疏', icon: 'thin', type: 'light', delay: 0.15 },
    { text: '大面積缺髮', icon: 'crown', type: 'dark', delay: 0.25 },
    { text: 'M型禿', icon: 'm-shape', type: 'dark', delay: 0.3 },
    { text: '地中海禿', icon: 'crown', type: 'light', delay: 0.35 },
    { text: '產後落髮', icon: 'thin', type: 'dark', delay: 0.4 },
    { text: '化療護理', icon: 'patch', type: 'light', delay: 0.45 },
    { text: '遮蓋白髮', icon: 'grey', type: 'dark', delay: 0.5 },
  ];

  // Simple Vector / Custom Image Diagrams for Hair Loss Patterns
  const hairDiagrams = [
    {
      title: '髮際線倒退',
      desc: '兩側額角後移、髮際線上升',
      image: '/images/髮際線後退.png',
      svg: null
    },
    {
      title: '頭頂地中海 O 型',
      desc: '髮旋週邊稀疏、頭皮隱約可見',
      image: '/images/地中海.png',
      svg: null
    },
    {
      title: '整體髮量稀疏',
      desc: '分髮線變寬、整體蓬鬆度不足',
      image: '/images/整體髮量稀疏.png',
      svg: null
    },
    {
      title: '局部缺髮 / 斑禿',
      desc: '塊狀掉髮、局部稀疏遮蓋',
      image: '/images/局部缺髮.png',
      svg: null
    },
    {
      title: '大面積 / 全禿',
      desc: '全頭無髮、化療護理全罩配戴',
      image: '/images/全禿.png',
      svg: null
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-zinc-950 text-white relative overflow-hidden select-none border-y border-zinc-800">
      {/* Background subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.1)_0,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Top Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880] text-xs font-black tracking-widest uppercase mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#c5a880]" />
          告別落髮焦慮 ‧ 找回自信風采
        </motion.div>

        {/* Speech Bubbles Cloud Area */}
        <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-4 px-2">
          {bubbles.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: b.delay }}
              whileHover={{ scale: 1.08, rotate: idx % 2 === 0 ? 2 : -2 }}
              className={`relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm tracking-wide shadow-lg border transition-all duration-300 cursor-default ${
                b.type === 'dark'
                  ? 'bg-zinc-900 text-white border-zinc-700 shadow-zinc-950/80 hover:border-[#c5a880]/60'
                  : 'bg-zinc-100 text-zinc-950 border-white shadow-zinc-900/50 hover:bg-white hover:border-[#c5a880]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${b.type === 'dark' ? 'bg-[#c5a880]' : 'bg-zinc-950'}`} />
                <span>{b.text}</span>
              </div>
              {/* Little speech bubble tail */}
              <div
                className={`absolute -bottom-1.5 ${
                  idx % 2 === 0 ? 'left-5' : 'right-5'
                } w-2.5 h-2.5 rotate-45 ${
                  b.type === 'dark' ? 'bg-zinc-900 border-r border-b border-zinc-700' : 'bg-zinc-100'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Simple Vector Diagrams for Hair Loss Symptoms */}
        <div className="w-full max-w-6xl my-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {hairDiagrams.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-[#c5a880]/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 group hover:bg-zinc-900"
            >
              <div className="w-20 h-20 rounded-full bg-zinc-950/80 border border-zinc-800 group-hover:border-[#c5a880]/40 flex items-center justify-center mb-3 transition-colors shadow-inner overflow-hidden">
                {item.image ? (
                  <img loading="lazy" decoding="async"
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  item.svg
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#c5a880] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Curved Arrow Section pointing down */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="my-2 flex flex-col items-center relative"
        >
          {/* Animated SVG curved arrow in brand soft brown */}
          <svg
            className="w-16 h-20 sm:w-20 sm:h-24 text-[#c5a880] filter drop-shadow-[0_0_10px_rgba(197,168,128,0.5)] transform -rotate-6 animate-pulse"
            viewBox="0 0 100 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 70 10 C 30 30, 20 80, 50 100" />
            <path d="M 35 88 L 52 102 L 58 82" />
          </svg>
        </motion.div>

        {/* Main High-Impact Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 max-w-3xl mt-2"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            你的 <span className="text-[#c5a880]">煩惱困擾</span>，交給{' '}
            <span className="text-[#c5a880] underline decoration-[#c5a880]/60 decoration-wavy underline-offset-8 inline-block">
              大衛假髮
            </span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-lg font-normal max-w-xl mx-auto leading-relaxed pt-2">
            一對一全隔音私密包廂 ‧ 100% 真人髮客製化量身打模修剪<br />
            為您打造最逼真無痕的第二張臉！
          </p>

          {/* Key Value Props Badge Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-xs sm:text-sm text-zinc-300 font-bold">
            <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
              100% 嚴選真髮
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
              透氣不悶熱
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <HeartHandshake className="w-4 h-4 text-[#c5a880]" />
              專業修剪造型
            </span>
          </div>
        </motion.div>

        {/* Quick Action Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8 sm:mt-10"
        >
          <a
            href="https://line.me/R/ti/p/@davidhair"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-2xl font-black text-sm sm:text-base transition-all hover:scale-105 shadow-xl shadow-[#06C755]/20 flex items-center gap-2 group cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>線上 LINE 私密諮詢</span>
          </a>

          <button
            onClick={() => {
              const el = document.getElementById('locations');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-[#c5a880] border border-[#c5a880]/40 rounded-2xl font-black text-sm sm:text-base transition-all hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-[#c5a880]" />
            <span>全台實體門市體驗</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}


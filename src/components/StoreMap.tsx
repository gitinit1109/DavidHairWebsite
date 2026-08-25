import React, { useState } from 'react';
import { MapPin, Clock, Phone, ExternalLink, Navigation } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  fullAddress: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
  gmapsUrl: string;
  details: string;
  osmEmbedUrl: string;
}

const BRANCHES: Branch[] = [
  {
    id: 'taipei',
    name: '大衛假髮 台北忠孝旗艦店',
    shortName: 'TPE 台北店',
    address: '106臺北市大安區仁愛里忠孝東路四段112號11F-13',
    fullAddress: '106臺北市大安區仁愛里忠孝東路四段112號11F-13',
    hours: '10:00 - 19:00',
    phone: '02-2771-3329 (採預約制)',
    lat: 25.0416,
    lng: 121.5438,
    gmapsUrl: 'https://www.google.com/maps/search/?api=1&query=106%E8%87%BA%E5%8C%97%E5%B8%82%E5%A4%A7%E5%AE%89%E5%8D%80%E4%BB%81%E6%84%9B%E9%87%8C%E5%BF%A0%E5%AD%9D%E6%9D%B1%E8%B7%AF%E5%9B%9B%E6%AE%B5112%E8%99%9F11F-13',
    details: '捷運忠孝復興站 3 號出口步行約 3 分鐘，台北漢宮大廈內。專為髮友提供獨立VIP諮詢包廂。',
    osmEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=121.5418,25.0396,121.5458,25.0436&layer=mapnik&marker=25.0416,121.5438'
  },
  {
    id: 'taichung',
    name: '大衛假髮 台中店',
    shortName: 'TXG 台中店',
    address: '台中市西屯區台灣大道二段906號2樓',
    fullAddress: '台中市西屯區台灣大道二段906號2樓',
    hours: '10:00 - 19:00',
    phone: '04-2312-3329 (採預約制)',
    lat: 24.1612,
    lng: 120.6481,
    gmapsUrl: 'https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E4%B8%AD%E5%B8%82%E8%A5%BF%E5%B1%AF%E5%8D%80%E5%8F%B0%E7%81%A3%E5%A4%A7%E9%81%93%E4%BA%8C%E6%AE%B5906%E8%99%9F2%E6%A8%93',
    details: '位於台灣大道二段，交通便捷。提供全隔音獨立預約制 VIP 包廂，隱密性極高。',
    osmEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=120.6461,24.1592,120.6501,24.1632&layer=mapnik&marker=24.1612,120.6481'
  },
  {
    id: 'kaohsiung',
    name: '大衛假髮 高雄橋頭創始店',
    shortName: 'KHH 高雄店',
    address: '825高雄市橋頭區仕豐南路仕龍西巷10號',
    fullAddress: '825高雄市橋頭區仕豐南路仕龍西巷10號',
    hours: '10:00 - 19:00 (每週三、四公休)',
    phone: '07-611-3829 (採預約制)',
    lat: 22.7574,
    lng: 120.3015,
    gmapsUrl: 'https://www.google.com/maps/search/?api=1&query=825%E9%AB%98%E9%9B%84%E5%B8%82%E6%A5%8B%E9%A1%9D%E5%8D%80%E4%BB%95%E8%B1%90%E5%8D%97%E8%B7%AF%E4%BB%95%E9%BE%8D%E8%A5%BF%E5%B7%B710%E8%99%9F',
    details: '捷運橋頭糖廠站/橋頭火車站附近，店門口即可停車。極具隱密性的透天式訂製空間。',
    osmEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=120.2995,22.7554,120.3035,22.7594&layer=mapnik&marker=22.7574,120.3015'
  }
];

export default function StoreMap() {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(BRANCHES[0]);

  return (
    <div className="max-w-7xl mx-auto mt-12 flex flex-col gap-6 font-sans select-none">
      
      {/* Main Locator Panel */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col lg:flex-row h-auto lg:h-[620px] relative">
        
        {/* Sidebar List */}
        <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-auto lg:h-full shrink-0">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 text-left">
            <span className="text-xs font-black text-[#8e7a64] uppercase tracking-widest block mb-1">
              interactive map locator
            </span>
            <h4 className="text-xl font-black text-zinc-900">門市即時定位</h4>
            <p className="text-zinc-500 text-xs font-light mt-1">點擊下方門市可即時更新地圖定位，隨時規劃前往路線</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] lg:max-h-none">
            {BRANCHES.map((b) => {
              const isSelected = selectedBranch.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#8e7a64]/10 border-[#8e7a64] shadow-sm'
                      : 'bg-white border-zinc-150 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-[#8e7a64] text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {b.shortName}
                    </span>
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#8e7a64]' : 'text-zinc-400'}`} />
                  </div>
                  
                  <h5 className="font-extrabold text-zinc-900 text-base">{b.name}</h5>
                  <p className="text-zinc-650 text-xs font-normal leading-relaxed">{b.details}</p>
                  
                  <div className="mt-1 pt-2 border-t border-dashed border-zinc-100 text-xs text-zinc-600 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{b.hours}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map display */}
        <div className="flex-1 flex flex-col md:flex-row relative h-[450px] lg:h-full bg-zinc-100 overflow-hidden">
          
          {/* Iframe OSM Area */}
          <div className="flex-1 h-2/3 md:h-full relative overflow-hidden">
            <iframe
              title={`大衛假髮-${selectedBranch.name} 地圖定位`}
              src={selectedBranch.osmEmbedUrl}
              className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
              sandbox="allow-scripts allow-same-origin"
            />
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 shadow-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>地圖定位點：{selectedBranch.shortName}</span>
            </div>
          </div>

          {/* Elegant Detail Overlay Drawer / Side-info */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-zinc-200 p-6 flex flex-col justify-between text-left h-1/3 md:h-full overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-[#8e7a64] uppercase tracking-widest bg-[#8e7a64]/10 px-2.5 py-1 rounded-md">
                  Selected Branch
                </span>
                <h4 className="text-lg font-black text-zinc-950 mt-2">{selectedBranch.name}</h4>
                <p className="text-zinc-500 text-xs mt-1 font-light leading-relaxed">{selectedBranch.details}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-[#8e7a64] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-zinc-900">門市地址</p>
                    <p className="text-zinc-650 font-medium mt-0.5 leading-relaxed">{selectedBranch.address}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-[#8e7a64] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-zinc-900">預約諮詢專線</p>
                    <p className="text-zinc-650 font-medium mt-0.5">{selectedBranch.phone}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-[#8e7a64] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-zinc-900">營業時間</p>
                    <p className="text-zinc-650 font-medium mt-0.5">{selectedBranch.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* External Action Button */}
            <div className="pt-4 border-t border-zinc-100 mt-4">
              <a
                href={selectedBranch.gmapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8e7a64] to-[#70604f] hover:from-[#70604f] hover:to-[#574a3c] text-white py-3 px-4 rounded-xl font-extrabold text-xs tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-98"
              >
                <ExternalLink className="w-4 h-4" />
                <span>在 Google 地圖規劃導航</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

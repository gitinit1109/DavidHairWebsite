import { Scissors, Ruler, Sparkles, Clock, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings, Sliders, Menu, MessageCircle, Star, PackageSearch, Shield, ShieldCheck, MapPin, Phone, ThumbsUp, HeartHandshake, HeadphonesIcon, BookHeart, Instagram, Facebook, AtSign, Mail, Send, X, Bot, Play, Youtube, Sparkle, ArrowUpRight, Heart, Smile, Leaf, Diamond, User as UserIcon, ShoppingCart, ShoppingBag, CreditCard, Truck, History, ClipboardList, Trash2, Plus, Minus, Home, ZoomIn, Maximize2 } from 'lucide-react';
import { motion, useInView, useSpring, useMotionValue, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChannelVideos, YouTubeVideo } from './services/youtubeService';
import { auth, logoutUser, loginWithAdminCredentials, onAuthStateChanged, User, registerMember, loginMember, deleteMember, getMembersList, RegisteredMember, createDbOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder, DbOrder } from './services/firebase';
import EditableText from './components/EditableText';
import HairTroubleBanner from './components/HairTroubleBanner';
import type { StoreProduct } from './components/OnlineStore';

// Lazily loaded views: each is only shown behind a `currentView` switch, so
// code-splitting them keeps the initial bundle (home page) small instead of
// shipping Firebase/Google Maps/markdown code that most visitors never touch.
const MensWigCatalog = lazy(() => import('./components/MensWigCatalog'));
const WomensWigCatalog = lazy(() => import('./components/WomensWigCatalog'));
const ChemoWigCatalog = lazy(() => import('./components/ChemoWigCatalog'));
const BlogSystem = lazy(() => import('./components/BlogSystem'));
const ReviewSystem = lazy(() => import('./components/ReviewSystem'));
const StoreMap = lazy(() => import('./components/StoreMap'));
const OnlineStore = lazy(() => import('./components/OnlineStore'));

// Shared fallback shown while a lazily loaded view's code is downloading.
function ViewLoadingFallback() {
  return (
    <div className="py-24 flex justify-center items-center">
      <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );
}




function CustomCursor({ enabled }: { enabled: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isPointer, setIsPointer] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if it's a mobile/touch device or small screen
    const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    if (isMobile || !enabled) {
      setIsReady(false);
      return;
    }
    
    setIsReady(true);
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const target = e.target as HTMLElement | null;
          if (target) {
            const isClickable = target.tagName === 'A' ||
              target.tagName === 'BUTTON' ||
              target.tagName === 'INPUT' ||
              target.tagName === 'SELECT' ||
              target.closest('button') !== null ||
              target.closest('a') !== null;
            setIsPointer(isClickable);
          }
          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY, enabled]);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  if (!isReady) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-brand-500 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isPointer ? 1.5 : 1,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-brand-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
}

function TypewriterHeading({ text, className = "", delay = 0, hideCursor = false }: { text: string; className?: string; delay?: number; hideCursor?: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (!isInView) return;

    let active = true;
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (!active) {
          clearInterval(interval);
          return;
        }
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [isInView, text, delay]);

  return (
    <span ref={ref} className={`inline-flex items-center leading-normal relative ${className}`} style={{ minHeight: '1.2em' }}>
      {/* Hidden layout reservation so the container doesn't jump or collapse to 0x0 */}
      <span className="opacity-0 pointer-events-none select-none absolute left-0 top-0 whitespace-nowrap">
        {text}
      </span>
      <span>{displayedText || "\u00A0"}</span>
      {!hideCursor && (
        <motion.span 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block w-[3px] h-[1em] bg-brand-500 ml-1 rounded-full align-middle"
        />
      )}
    </span>
  );
}

function Marquee({ text }: { text: string }) {
  return (
    <div className="bg-brand-500 py-4 overflow-hidden border-y border-brand-600/20 relative">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="text-zinc-950 font-black text-lg md:text-2xl tracking-[0.2em] flex items-center gap-4">
              <Sparkles className="w-6 h-6 fill-zinc-950" />
              {text}
            </span>
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-500 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-500 to-transparent z-10" />
    </div>
  );
}

function MemberDeleteButton({ member, onDelete }: { member: RegisteredMember; onDelete: (uid: string) => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <button
          type="button"
          onClick={async () => {
            try {
              setIsDeleting(true);
              await onDelete(member.uid);
            } catch (err) {
              setIsConfirming(false);
            } finally {
              setIsDeleting(false);
            }
          }}
          disabled={isDeleting}
          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
        >
          {isDeleting ? "處理中..." : "確定"}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="px-3 py-1 bg-white hover:bg-red-50 text-zinc-500 hover:text-red-600 text-xs font-bold rounded-xl transition-all border border-zinc-200 hover:border-red-200 cursor-pointer"
    >
      刪除
    </button>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'brand-story' | 'about-us' | 'mens-catalog' | 'womens-catalog' | 'chemo-catalog' | 'shop' | 'faq' | 'cases' | 'blog' | 'locations'>('home');
  const [activeTab, setActiveTab] = useState<string>('home');
  // Which 內容專區 (blog) category to open to when arriving via a header dropdown link.
  const [blogEntryCategory, setBlogEntryCategory] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [hoveredStepIdx, setHoveredStepIdx] = useState<number | null>(null);

  // Each item may carry a `children` dropdown list. A child's `category` (when
  // present) is handed to the target view so it can open pre-filtered/scrolled
  // to that section (see blogEntryCategory below for the 內容專區 case).
  const navItems: {
    id: string;
    label: string;
    type: 'view';
    target: string;
    children?: { label: string; target: string; category?: string }[];
  }[] = [
    { id: 'home', label: '首頁', type: 'view', target: 'home' },
    { id: 'brand-story', label: '品牌故事', type: 'view', target: 'brand-story' },
    { id: 'mens-catalog', label: '男性假髮', type: 'view', target: 'mens-catalog' },
    { id: 'womens-catalog', label: '女性假髮', type: 'view', target: 'womens-catalog' },
    {
      id: 'chemo-catalog', label: '化療假髮', type: 'view', target: 'chemo-catalog',
      children: [
        { label: '輕量透氣款', target: 'chemo-catalog' },
        { label: '親膚固定專用款', target: 'chemo-catalog' },
      ],
    },
    {
      id: 'shop', label: '線上商城', type: 'view', target: 'shop',
      children: [
        { label: '熱銷商品', target: 'shop' },
        { label: '假髮護理', target: 'shop' },
        { label: '假髮護片', target: 'shop' },
        { label: '假髮膠水', target: 'shop' },
        { label: '防塵罩品', target: 'shop' },
        { label: '日常保養＆清潔用具', target: 'shop' },
      ],
    },
    {
      id: 'blog', label: '內容專區', type: 'view', target: 'blog',
      children: [
        { label: '主理人專欄', target: 'blog', category: '主理人專欄' },
        { label: '知識分享', target: 'blog', category: '知識分享' },
        { label: '最新消息', target: 'blog', category: '最新消息' },
        { label: '活動與公告', target: 'blog', category: '活動與公告' },
      ],
    },
    { id: 'about-us', label: '關於我們', type: 'view', target: 'about-us' },
  ];

  useEffect(() => {
    setActiveTab(currentView);
  }, [currentView]);
  const [docModal, setDocModal] = useState<'privacy' | 'terms' | 'shipping' | 'returns' | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; subtitle: string; desc: string } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const isAdminUser = !!user && (user.email === 'david@davidhair.com' || user.uid === 'admin_david_999' || user.email === 'hankyleisplay@gmail.com' || user.email === '7uuuuu2uuu198.net@gmail.com');
  const navScrollRef = useRef<HTMLDivElement>(null);

  // PC/Desktop dynamic Liquid Glass detector
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const wideEnough = window.innerWidth >= 1024;
      setIsDesktop(!isMobileUA && !hasTouch && wideEnough);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Auth System States
  const [isGlobalLoginModalOpen, setIsGlobalLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'member-login' | 'member-register' | 'admin-login'>('member-login');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [globalLoginError, setGlobalLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [globalLoginSuccessMessage, setGlobalLoginSuccessMessage] = useState('');
  const [isSelfDeleteConfirmOpen, setIsSelfDeleteConfirmOpen] = useState(false);
  const [isAdminMemberManagerOpen, setIsAdminMemberManagerOpen] = useState(false);
  const [isAdminPanelCollapsed, setIsAdminPanelCollapsed] = useState(false);
  const [membersList, setMembersList] = useState<RegisteredMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selfDeleteSuccess, setSelfDeleteSuccess] = useState(false);
  const [selfDeleteError, setSelfDeleteError] = useState('');

  // Sync auth updates
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Shopping Cart & Order States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('貨到付款');
  const [deliveryMethod, setDeliveryMethod] = useState('宅配到府');
  const [storeSelection, setStoreSelection] = useState('台北門市（台北市大安區忠孝東路四段112號11F-13）');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [userOrders, setUserOrders] = useState<DbOrder[]>([]);
  const [isUserOrdersOpen, setIsUserOrdersOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [adminOrders, setAdminOrders] = useState<DbOrder[]>([]);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  interface CartItem {
    id: string;
    productId: string;
    title: string;
    imgUrl: string;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
  }

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!recipientName.trim()) {
      alert("請填寫收件人姓名！");
      return;
    }
    if (!recipientPhone.trim()) {
      alert("請填寫收件人電話！");
      return;
    }
    
    const finalAddress = deliveryMethod === '門市自取' 
      ? `【門市自取】${storeSelection}` 
      : recipientAddress.trim();

    if (deliveryMethod !== '門市自取' && !finalAddress) {
      alert("請填寫收件地址！");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderData = {
        userId: user ? user.uid : 'guest_customer',
        userEmail: user ? (user.email || 'guest@davidhair.com') : 'guest@davidhair.com',
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientAddress: finalAddress,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        totalAmount
      };

      const newOrder = await createDbOrder(orderData);
      setOrderSuccessId(newOrder.id);
      setCart([]); // Clear cart
      setIsCheckoutStep(false);
      if (user) {
        handleFetchUserOrders();
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("下單失敗，請稍後再試，或直接聯絡大衛哥 Line 客服！");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleAddToCart = (product: StoreProduct, options: { size: string; color: string; customPrice?: number }) => {
    const itemId = `${product.id}-${options.size}-${options.color}`;
    const finalPrice = options.customPrice !== undefined ? options.customPrice : product.price;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, {
          id: itemId,
          productId: product.id,
          title: product.title,
          imgUrl: product.imgUrl,
          price: finalPrice,
          quantity: 1,
          selectedSize: options.size,
          selectedColor: options.color
        }];
      }
    });
    setIsCartOpen(true);
  };

  const handleFetchUserOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const orders = await getUserOrders(user.uid);
      setUserOrders(orders);
    } catch (err) {
      console.error("Error loading user orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleFetchAllOrders = async () => {
    try {
      const orders = await getAllOrders();
      setAdminOrders(orders);
    } catch (err) {
      console.error("Error loading admin orders:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled') => {
    try {
      await updateOrderStatus(orderId, newStatus);
      handleFetchAllOrders(); // Refresh list
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("狀態更新失敗，請檢查網路連線或稍後再試！");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("大衛哥，確定要刪除這筆訂單資料嗎？刪除後將無法復原。")) {
      return;
    }
    try {
      await deleteOrder(orderId);
      handleFetchAllOrders(); // Refresh list
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("刪除訂單失敗，請稍後再試！");
    }
  };

  // Auto-fetch user orders when logged in
  useEffect(() => {
    if (user) {
      handleFetchUserOrders();
      if (user.email === 'david@davidhair.com' || user.uid === 'admin_david_999') {
        handleFetchAllOrders();
      }
    } else {
      setUserOrders([]);
      setAdminOrders([]);
    }
  }, [user]);

  // Global Font Size adjustment for better readability (elder/vision-impaired users)
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'extra'>(() => {
    const saved = localStorage.getItem('david_font_size');
    if (saved === 'large' || saved === 'extra' || saved === 'normal') {
      return saved as 'normal' | 'large' | 'extra';
    }
    return 'normal';
  });

  useEffect(() => {
    localStorage.setItem('david_font_size', fontSizeMode);
    const htmlEl = document.documentElement;
    if (fontSizeMode === 'large') {
      htmlEl.style.fontSize = '18px'; // Increases sizes by ~12.5%
    } else if (fontSizeMode === 'extra') {
      htmlEl.style.fontSize = '20px'; // Increases sizes by ~25%
    } else {
      htmlEl.style.fontSize = ''; // Default standard 16px
    }
  }, [fontSizeMode]);

  // Prevent F12, Ctrl+Shift+I, right-click and detect DevTools
  const [isDevToolsWarningOpen, setIsDevToolsWarningOpen] = useState(false);

  useEffect(() => {
    // 1. Prevent Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent F12, Ctrl+Shift+I/J/C, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsWarningOpen(true);
        return false;
      }
      // Ctrl+Shift+I (Cmd+Opt+I on Mac)
      if (
        (isMac && e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) ||
        (!isMac && e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsWarningOpen(true);
        return false;
      }
      // Ctrl+Shift+J (Cmd+Opt+J on Mac)
      if (
        (isMac && e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) ||
        (!isMac && e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsWarningOpen(true);
        return false;
      }
      // Ctrl+Shift+C (Cmd+Opt+C on Mac)
      if (
        (isMac && e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) ||
        (!isMac && e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsWarningOpen(true);
        return false;
      }
      // Ctrl+U (Cmd+Opt+U on Mac) - View Source
      if (
        (isMac && e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) ||
        (!isMac && e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsWarningOpen(true);
        return false;
      }
    };

    // 3. DevTools keyboard shortcut prevention without blocking window resize
    const checkDevTools = () => {
      // Avoid false positive triggers on window resizing, browser zooming, or sidebars
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const res = await fetch('/api/site-content');
        if (res.ok) {
          const data = await res.json();
          setSiteContent(data);
        }
      } catch (err) {
        console.error("Failed to load customized site content:", err);
      }
    };
    fetchSiteContent();
  }, []);

  const handleSaveSiteContent = async (key: string, value: string) => {
    try {
      setSiteContent(prev => ({ ...prev, [key]: value }));
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (!res.ok) {
        console.error("Failed to persist site content on server");
      }
    } catch (err) {
      console.error("Error writing customized site content:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const list = await getMembersList();
      setMembersList(list);
    } catch (err: any) {
      console.error("Failed to load members list:", err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleDeleteMember = async (uid: string) => {
    try {
      await deleteMember(uid);
      if (isAdminUser) {
        setMembersList(prev => prev.filter(m => m.uid !== uid));
      }
    } catch (err: any) {
      console.error("Failed to delete member:", err);
      throw err;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const loadVideos = async () => {
      const data = await fetchChannelVideos('@davidhair2025');
      setVideos(data);
      if (data.length > 0) {
        setSelectedVideo(data[0]);
      }
    };
    loadVideos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  const renderSubpageHeader = (title: string, subtitle?: string) => (
    <div className="pt-32 pb-10 bg-gradient-to-b from-zinc-50 via-zinc-50/60 to-white border-b border-zinc-150 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#8e7a64] tracking-tight">{title}</h1>
            {subtitle && <p className="text-zinc-500 text-xs sm:text-sm md:text-base font-bold mt-2">{subtitle}</p>}
          </div>
          <div className="text-xs font-black text-zinc-400 self-start md:self-end">
            首頁 &gt; <span className="text-[#8e7a64] font-black">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative text-zinc-900 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden ${isDesktop ? 'liquid-glass-bg is-desktop' : 'bg-[#fcfaf7]'} ${cursorEnabled ? 'md:cursor-none' : ''}`}>
      <CustomCursor enabled={cursorEnabled} />

      {/* DevTools Warning overlay */}
      {isDevToolsWarningOpen && (
        <div className="fixed inset-0 z-[999999] bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none font-sans">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
              <Shield className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">偵測到快捷鍵提示</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                為維護假髮專利製程與客戶隱私，請避免開啟除錯工具。
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsDevToolsWarningOpen(false)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-black rounded-xl text-sm transition-all cursor-pointer shadow-lg"
              >
                我知道了，繼續瀏覽
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Liquid Glass Blobs - PC/Desktop with Google 4-color Glow (Blue, Red, Yellow, Green) */}
      {isDesktop && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden liquid-glass-blob-container opacity-90">
          {/* Google Blue - Top Left */}
          <div className="absolute top-[5%] left-[5%] w-[32vw] h-[32vw] max-w-[450px] max-h-[450px] rounded-full liquid-google-blue" />
          {/* Google Red - Top Right */}
          <div className="absolute top-[15%] right-[5%] w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full liquid-google-red" />
          {/* Google Yellow - Bottom Left */}
          <div className="absolute bottom-[10%] left-[8%] w-[35vw] h-[35vw] max-w-[480px] max-h-[480px] rounded-full liquid-google-yellow" />
          {/* Google Green - Bottom Right */}
          <div className="absolute bottom-[15%] right-[10%] w-[33vw] h-[33vw] max-w-[460px] max-h-[460px] rounded-full liquid-google-green" />
        </div>
      )}
      


      {/* Navigation */}
      <nav className={`fixed inset-x-0 z-50 top-0 transition-all duration-300 h-16 lg:h-32 ${isScrolled ? 'shadow-lg' : ''} ${isDesktop ? 'liquid-glass-nav' : 'bg-white/95 border-b border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex lg:flex-col justify-between py-2 lg:py-2.5 select-none">
          
          {/* Row 1: Logo & CTA / User details */}
          <div className="flex justify-between items-center w-full h-full lg:h-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                onClick={() => {
                  setCurrentView('home');
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="flex-shrink-0">
                  <img src="/images/icon.png" alt="Logo" className="w-10 h-10 lg:w-14 lg:h-14 object-contain group-hover:scale-110 transition-all duration-300" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-black tracking-wide text-zinc-900 leading-none text-lg lg:text-2xl transition-all duration-300">大衛假髮</span>
                  <span className="text-[9px] text-zinc-400 font-medium tracking-normal hidden xl:inline-block leading-none mt-1">為閣下重現自然自信秀髮</span>
                </div>
              </motion.div>

              {/* Unified Return to Home Button */}
              <button
                onClick={() => {
                  setCurrentView('home');
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#8e7a64]/10 hover:bg-[#8e7a64]/20 text-[#8e7a64] rounded-xl text-[10px] sm:text-xs font-black transition-all border border-[#8e7a64]/20 shadow-xs cursor-pointer shrink-0 ml-1.5 sm:ml-2.5 hover:scale-105 active:scale-95"
              >
                <Home size={14} className="shrink-0 text-[#8e7a64]" />
                <span>返回首頁</span>
              </button>
            </div>
            
            {/* Desktop Actions Row 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-1.5 sm:gap-2.5"
            >
              {/* Font Size Selector for Better Readability */}
              <div className="flex items-center gap-0.5 bg-zinc-100/90 border border-zinc-200/60 p-0.5 rounded-full shadow-sm hover:border-zinc-300 transition-colors">
                <span className="text-[10px] md:text-xs font-black text-zinc-500 select-none pl-2 pr-1 hidden xs:inline">
                  字體
                </span>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('normal')}
                  className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    fontSizeMode === 'normal'
                      ? 'bg-brand-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                  title="標準字體大小"
                >
                  標準
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('large')}
                  className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    fontSizeMode === 'large'
                      ? 'bg-brand-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                  title="放大 12.5% 字體大小"
                >
                  放大
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('extra')}
                  className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    fontSizeMode === 'extra'
                      ? 'bg-brand-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                  title="放大 25% 字體大小"
                >
                  特大
                </button>
              </div>

              {user ? (
                <div className="relative flex items-center gap-1.5 md:gap-2">
                  <div className="hidden xs:flex flex-col text-right">
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-900 leading-none truncate max-w-[80px]">
                      {user.displayName || "尊榮貴賓"}
                    </span>
                    <span className="text-[7px] md:text-[8px] font-bold text-brand-600 tracking-wider mt-0.5 uppercase">VIP會員</span>
                  </div>
                  <div className="relative group/user py-1.5">
                    <button className="relative w-8 h-8 rounded-full border border-brand-400 overflow-hidden cursor-pointer shadow-sm hover:border-brand-500 transition-all flex items-center justify-center bg-white">
                      {user.photoURL ? (
                        <img loading="lazy" decoding="async" src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-brand-500 text-zinc-950 font-black flex items-center justify-center text-xs">
                          {user.displayName ? user.displayName.charAt(0) : "V"}
                        </div>
                      )}
                    </button>
                    {/* Hover Dropdown */}
                    <div className="absolute right-0 mt-1 w-44 md:w-48 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2.5 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-50">
                      <div className="px-4 py-1.5 border-b border-zinc-100 mb-1.5">
                        <p className="font-extrabold text-[11px] md:text-xs text-zinc-900 truncate">{user.displayName || "貴賓會員"}</p>
                        <p className="text-[7px] md:text-[8px] text-zinc-400 mt-0.5 truncate">{user.email}</p>
                      </div>
                      <div className="px-4 py-1">
                        <p className="text-[7px] md:text-[8px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          專屬顧問在線
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          handleFetchUserOrders();
                          setIsUserOrdersOpen(true);
                        }}
                        className="w-full text-left px-4 py-1.5 text-[9px] md:text-[10px] text-zinc-700 hover:bg-brand-50 hover:text-brand-700 transition-colors font-bold cursor-pointer border-t border-zinc-100 flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-3 h-3 text-brand-500" />
                        我的訂單 History
                      </button>
                      {!isAdminUser && (
                        <button 
                          onClick={() => {
                            setIsSelfDeleteConfirmOpen(true);
                          }}
                          className="w-full text-left px-4 py-1.5 text-[9px] md:text-[10px] text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold cursor-pointer"
                        >
                          刪除會員帳號 Delete Account
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          await logoutUser();
                        }}
                        className="w-full text-left px-4 py-1.5 text-[9px] md:text-[10px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold mt-1 cursor-pointer"
                      >
                        登出帳號 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsGlobalLoginModalOpen(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-zinc-950 px-2.5 py-1.5 rounded-full font-black text-[9px] md:text-[10px] transition-all shadow-sm active:scale-95 border border-brand-300/30 cursor-pointer"
                >
                  <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-950" />
                  <span>登入</span>
                </button>
              )}

              <a 
                href="https://line.me/R/ti/p/@davidhair" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 bg-[#06C755] hover:bg-[#05b04b] border border-[#05b04b] text-white rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-sm px-2.5 py-1.5 text-[10px] md:text-xs whitespace-nowrap"
              >
                <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-white shrink-0" />
                Line諮詢
              </a>
              <a 
                href="https://www.youtube.com/@davidhair2025" 
                target="_blank" 
                rel="noreferrer" 
                className="hidden sm:flex items-center gap-1 bg-[#FF0000] hover:bg-[#e60000] border border-[#e60000] text-white rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-sm px-2.5 py-1.5 text-[10px] md:text-xs whitespace-nowrap"
              >
                <Youtube className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-white" />
                YouTube頻道
              </a>
              <a 
                href="#locations"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('locations');
                  setActiveTab('locations');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-sm px-2.5 py-1.5 text-[10px] md:text-xs whitespace-nowrap cursor-pointer"
              >
                <Scissors className="w-3 h-3 md:w-3.5 md:h-3.5 text-brand-500 shrink-0" />
                預約試戴
              </a>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1 bg-white border border-zinc-200 hover:border-brand-400 text-zinc-900 hover:text-brand-600 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-sm px-2.5 py-1.5 text-[10px] md:text-xs whitespace-nowrap cursor-pointer"
              >
                <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5 text-zinc-750 shrink-0" />
                <span>購物車</span>
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="bg-brand-500 text-zinc-950 font-sans text-[8px] md:text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </motion.div>

            {/* Mobile/Tablet Menu & Cart Button */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px]"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-zinc-950 font-sans text-[8px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center shadow">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px]"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          
          {/* Row 2: Always-Visible Horizontal Menu (一目了然橫列式) - Only show on Desktop */}
          <div className="hidden lg:block w-full border-t border-zinc-200/50 dark:border-zinc-800/10 pt-2 pb-0.5 mt-1.5">
            <div 
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  e.currentTarget.scrollLeft += e.deltaY * 1.2;
                }
              }}
              className={`flex items-center overflow-x-auto scrollbar-none gap-2 md:gap-4 -mx-4 md:mx-0 px-4 md:px-0 scroll-smooth ${
                fontSizeMode === 'extra' || fontSizeMode === 'large' ? 'justify-start' : 'justify-start lg:justify-center'
              }`}
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id || currentView === item.target;
                return (
                  <div key={item.id} className="relative group/navdd shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setBlogEntryCategory('all');
                        setCurrentView(item.target as any);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className={`flex items-center gap-1 px-3.5 md:px-5 py-1.5 rounded-lg text-xs md:text-sm font-extrabold tracking-widest transition-all duration-300 select-none cursor-pointer ${
                        isActive
                          ? 'bg-zinc-200/80 text-brand-600 shadow-sm border border-zinc-300/30 font-black'
                          : 'text-zinc-800 hover:text-brand-600 hover:bg-zinc-100/50'
                      }`}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown className="w-3 h-3 opacity-60 group-hover/navdd:rotate-180 transition-transform duration-200" />
                      )}
                    </button>

                    {/* Dropdown panel */}
                    {item.children && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible translate-y-1 group-hover/navdd:opacity-100 group-hover/navdd:visible group-hover/navdd:translate-y-0 transition-all duration-200 z-50">
                        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/70 p-2 min-w-[168px] flex flex-col gap-0.5">
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              onClick={() => {
                                setActiveTab(item.id);
                                setBlogEntryCategory(child.category || 'all');
                                setCurrentView(child.target as any);
                                window.scrollTo({ top: 0, behavior: 'instant' });
                              }}
                              className="text-left px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-brand-50 hover:text-brand-700 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[300px] sm:w-[340px] bg-white shadow-2xl z-50 lg:hidden flex flex-col justify-between"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <img loading="lazy" decoding="async" src="/images/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-black text-zinc-900 tracking-wide">大衛假髮選單</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1.5 mb-8">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id || currentView === item.target;
                    const isSubmenuOpen = openMobileSubmenu === item.id;
                    return (
                      <div key={item.id}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setActiveTab(item.id);
                              setBlogEntryCategory('all');
                              setCurrentView(item.target as any);
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className={`flex-1 text-left px-4 py-3 rounded-xl text-sm font-extrabold tracking-widest transition-all min-h-[44px] flex items-center ${
                              isActive
                                ? 'bg-brand-50 text-brand-600 font-black'
                                : 'text-zinc-800 hover:bg-zinc-50'
                            }`}
                          >
                            {item.label}
                          </button>
                          {item.children && (
                            <button
                              onClick={() => setOpenMobileSubmenu(isSubmenuOpen ? null : item.id)}
                              aria-label={`展開 ${item.label} 子選單`}
                              className="p-3 rounded-xl text-zinc-500 hover:bg-zinc-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                            >
                              {isSubmenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        {item.children && isSubmenuOpen && (
                          <div className="pl-4 pr-1 py-1 flex flex-col gap-0.5">
                            {item.children.map((child) => (
                              <button
                                key={child.label}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setActiveTab(item.id);
                                  setBlogEntryCategory(child.category || 'all');
                                  setCurrentView(child.target as any);
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                                className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-brand-600 transition-all min-h-[40px] flex items-center"
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Font Size Mode Selector inside Drawer */}
                <div className="border-t border-zinc-100 pt-5 mb-6">
                  <p className="text-xs font-black text-zinc-400 mb-3 tracking-widest">閱讀字體大小</p>
                  <div className="grid grid-cols-3 gap-2 bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/50">
                    <button
                      type="button"
                      onClick={() => setFontSizeMode('normal')}
                      className={`py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        fontSizeMode === 'normal'
                          ? 'bg-white text-zinc-950 font-black shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      標準
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeMode('large')}
                      className={`py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        fontSizeMode === 'large'
                          ? 'bg-white text-zinc-950 font-black shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      放大
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeMode('extra')}
                      className={`py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        fontSizeMode === 'extra'
                          ? 'bg-white text-zinc-950 font-black shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      特大
                    </button>
                  </div>
                </div>

                {/* User Info inside Drawer */}
                {user ? (
                  <div className="border-t border-zinc-100 pt-5 mb-6">
                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/40 p-3.5 rounded-2xl">
                      <div className="w-10 h-10 rounded-full border border-brand-400 overflow-hidden shrink-0 bg-white">
                        {user.photoURL ? (
                          <img loading="lazy" decoding="async" src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-brand-500 text-zinc-950 font-black flex items-center justify-center text-sm">
                            {user.displayName ? user.displayName.charAt(0) : "V"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-zinc-900 truncate">{user.displayName || "尊榮貴賓"}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-1">
                      {!isAdminUser && (
                        <button 
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsSelfDeleteConfirmOpen(true);
                          }}
                          className="w-full text-center py-2 text-xs text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold rounded-xl cursor-pointer"
                        >
                          刪除會員帳號 Delete Account
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          await logoutUser();
                        }}
                        className="w-full text-center py-2.5 text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-colors font-black rounded-xl cursor-pointer"
                      >
                        登出帳號 Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsGlobalLoginModalOpen(true);
                    }}
                    className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-2xl font-black text-sm text-center transition-all flex items-center justify-center gap-2 border border-zinc-200/50 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    登入 VIP 會員
                  </button>
                )}
              </div>

              {/* Drawer Footer CTA Links */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-3">
                <a 
                  href="https://line.me/R/ti/p/@davidhair" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full py-3 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-white shrink-0" />
                  Line諮詢專區
                </a>
                <a 
                  href="https://www.youtube.com/@davidhair2025" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full py-3 bg-[#FF0000] hover:bg-[#e60000] text-white rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <Youtube className="w-4 h-4 text-white shrink-0" />
                  YouTube頻道
                </a>
                <a 
                  href="#locations"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    if (currentView !== 'home') {
                      setCurrentView('home');
                    }
                    setTimeout(() => {
                      const el = document.getElementById('locations');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, currentView !== 'home' ? 300 : 50);
                  }}
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-brand-500 shrink-0" />
                  預約試戴款式
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {currentView === 'home' && (
        <>
          {/* New Hero Section - Centered Clean Layout */}
          <section id="hero" className="relative h-auto min-h-[75vh] flex flex-col justify-center pt-32 pb-14 lg:pt-36 lg:pb-16 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f7f4ee] to-white select-none">
            {/* Background elegant circles/watermarks */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#fdfaf6]/30 skew-x-12 transform translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/10 w-[420px] h-[420px] bg-[#8e7a64]/3 rounded-full blur-[110px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-4 flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3ede4] border border-[#e3d5c3] text-[#786146] rounded-full text-xs font-black tracking-widest">
                  台灣在地品牌 ｜ 專業假髮 ． 用心服務
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-zinc-950 leading-none tracking-tight select-none">
                    大衛哥假髮
                  </h1>
                  <p className="text-2xl sm:text-4xl font-extrabold text-[#8e7a64] tracking-widest pt-2">
                    平價高品質 ． 自信每一天
                  </p>
                </div>
              </motion.div>
              
              {/* 5-Column Core Values Row/Grid with gold-accent icons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-zinc-200/60 pt-6 mt-8 w-full max-w-3xl"
              >
                {[
                  { title: "平價高品質", subt: "高CP值首選", icon: Diamond },
                  { title: "自然逼真", subt: "宛如真髮", icon: Shield },
                  { title: "輕盈舒適", subt: "長配戴無負擔", icon: Leaf },
                  { title: "量身訂製", subt: "專屬設計剪裁", icon: Scissors },
                  { title: "售後服務", subt: "安心保固調整", icon: Heart }
                ].map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    <div className="w-12 h-12 rounded-full border border-[#d6c4b0] bg-[#fdfbf9] flex items-center justify-center text-[#8e7a64] shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <val.icon className="w-5 h-5 text-[#8e7a64] shrink-0" />
                    </div>
                    <span className="font-sans font-black text-xs sm:text-sm text-zinc-800 leading-tight mt-3 mb-0.5 whitespace-nowrap">{val.title}</span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold tracking-tight whitespace-nowrap leading-none">{val.subt}</span>
                  </div>
                ))}
              </motion.div>
              
              {/* Free Reservation Call-To-Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-8"
              >
                <a 
                  href="https://line.me/R/ti/p/@davidhair" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-8 py-4 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.03] active:scale-95 shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-white shrink-0" />
                  <span>立即 LINE 進一步諮詢</span>
                </a>
                <button 
                  onClick={() => {
                    const el = document.getElementById('locations');
                    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                  }}
                  className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-800 rounded-2xl font-black text-sm hover:scale-[1.03] active:scale-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>免預約免費試戴</span>
                  <ArrowUpRight className="w-5 h-5 text-[#8e7a64]" />
                </button>
              </motion.div>
            </div>
          </section>

          {/* Hair Trouble & Concerns Banner Section */}
          <HairTroubleBanner />

          {/* Product Advantages Section (Moved above Locations) */}
          <section id="product-advantages" className="py-16 md:py-20 bg-white select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border border-zinc-200/75 rounded-3xl bg-[#faf9f6] p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col gap-10 relative overflow-hidden">
                
                {/* Top Row: Product Advantages Title + Checklist + David Card */}
                <div className="flex flex-col gap-6 pb-10 border-b border-zinc-200/80">
                  {/* Title */}
                  <div className="text-left">
                    <span className="text-[#8e7a64] font-extrabold text-xs tracking-widest uppercase block mb-1">
                      PRODUCT ADVANTAGES
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-none">
                      產品優勢
                    </h3>
                  </div>

                  {/* Row: 5 Checklist items + David Card side-by-side */}
                  <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 sm:gap-8">
                    
                    {/* Left: 5 Checklist items in single vertical column */}
                    <div className="flex-1 w-full flex flex-col justify-center">
                      <ul className="flex flex-col justify-between h-full gap-3">
                        {[
                          "精選優質真髮，自然柔順",
                          "透氣輕薄底網，配戴舒適",
                          "仿真頭皮設計，自然貼合",
                          "專業剪裁造型，修飾臉型",
                          "耐用持久，易於保養整理"
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-zinc-800 font-extrabold text-xs sm:text-sm leading-tight bg-white border border-zinc-200/60 px-4 py-3.5 rounded-xl shadow-2xs h-full">
                            <span className="w-5 h-5 rounded-full bg-[#8e7a64]/10 text-[#8e7a64] flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-[#8e7a64]" />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: 大衛哥 (David Portrait & Signature Block) enlarged as main centerpiece */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="relative flex flex-row items-center gap-6 sm:gap-10 bg-white p-7 sm:p-9 rounded-3xl border border-[#8e7a64]/30 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-2xl lg:max-w-[640px] w-full shrink-0 h-full overflow-hidden"
                    >
                      {/* Subtle golden ambient accent background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8e7a64]/5 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Portrait Frame Container - Hero Size */}
                      <div className="relative w-[180px] sm:w-[220px] lg:w-[250px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-lg bg-zinc-100 shrink-0 group">
                        {/* Main David Model Picture */}
                        <img loading="lazy" decoding="async" 
                          src="/images/大衛哥.jpg" 
                          alt="大衛哥 David 假髮職人" 
                          className="w-full h-full rounded-xl object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Brand Signature Text Column */}
                      <div className="flex flex-col text-left justify-center py-2 select-none flex-1 z-10">
                        <span className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider leading-none">大衛哥</span>
                        <span className="font-signature text-5xl sm:text-6xl text-zinc-800 leading-none mt-2.5">David</span>
                        <span className="text-[#8e7a64] font-extrabold text-sm sm:text-base tracking-wider mt-4 border-t border-zinc-200/80 pt-3.5 block">
                          假髮職人 ． 用心為您
                        </span>
                        <div className="mt-5 pointer-events-none opacity-85 relative">
                          <span className="font-signature text-4xl text-[#8e7a64] block leading-none transform -rotate-12 -translate-x-1">David</span>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>

                {/* Bottom Row: 四大核心技術擬真設計 */}
                <div className="flex flex-col gap-6 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-left">
                    <div>
                      <span className="text-[10px] md:text-xs font-black tracking-widest text-[#8e7a64] bg-[#8e7a64]/10 px-2.5 py-1 rounded-md uppercase">
                        科技工藝極致擬真
                      </span>
                      <h4 className="text-xl md:text-2xl font-black text-zinc-900 mt-2">
                        四大核心技術擬真設計
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-500">
                      💡 點擊下方任意技術圖片，即可開啟高清全圖與細節放大預覽
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        title: "自然髮旋",
                        subtitle: "仿真雙層頭皮髮旋",
                        highlights: "360°自然生長流向 ‧ 擬真漩渦",
                        desc: "採用獨家高精細雙層高分子仿真人工頭皮，搭配單針手工精細勾織技術，完美還原真實毛髮360度自然生長流向與旋渦氣流，近距離觀察亦無懼視線檢視，徹底解決傳統假髮頭旋死板生硬的問題。",
                        imgSrc: "/images/頭旋.jpg"
                      },
                      {
                        title: "逼真髮際線",
                        subtitle: "頂級手工單針植髮",
                        highlights: "自然不規則毛流 ‧ 掀瀏海隱形",
                        desc: "專為前額設計的超微薄漸進式隱形底網，經資深植髮職人以單根/雙根交錯手工鉤織，創造微亂自然的不規則邊緣毛流。不論是大方梳起掀瀏海、側分或高馬尾，額角邊緣過渡流暢自然，完全隱形不露痕跡。",
                        imgSrc: "/images/髮際線.jpg"
                      },
                      {
                        title: "透氣底網",
                        subtitle: "輕薄防敏微孔結構",
                        highlights: "親膚貼合 ‧ 極致排汗 ‧ 24H無感",
                        desc: "採用醫療級親膚低敏微孔雙層底網，兼具卓越張力與超高透氣率。重量僅數公克，能迅速排出頭皮汗水與熱氣，貼合顱骨不壓迫，長時間配戴也能保持清爽乾爽，夏季高溫與運動配戴依然舒適無負擔。",
                        imgSrc: "/images/雙層網.jpg"
                      },
                      {
                        title: "優質髮質",
                        subtitle: "100% 特級優質真髮",
                        highlights: "柔順光澤 ‧ 可染燙造型 ‧ 好整理",
                        desc: "嚴選100%未經化學強酸破壞的真髮絲，保留天然毛鱗片與健康彈性韌度。觸感如絲般順滑不糾結，擁有自然真實的光澤度，可完全比照真髮進行日常吹風造型、電棒捲髮、染髮與修剪，清潔保養簡單方便。",
                        imgSrc: "/images/烏黑亮麗.jpg"
                      }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex flex-col justify-between bg-white border border-zinc-200/75 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-[#8e7a64]/60 transition-all duration-300 text-left group"
                      >
                        {/* Header & Badges */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xl text-zinc-900">{item.title}</span>
                            <span className="text-[11px] font-extrabold text-[#8e7a64] bg-[#8e7a64]/10 px-2.5 py-0.5 rounded-full">
                              {item.subtitle}
                            </span>
                          </div>
                          
                          <div className="text-xs font-bold text-[#8e7a64] bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-lg inline-block">
                            {item.highlights}
                          </div>

                          {/* Detailed Text Description */}
                          <p className="text-xs text-zinc-600 font-medium leading-relaxed pt-1.5 border-t border-zinc-100">
                            {item.desc}
                          </p>
                        </div>

                        {/* Interactive Full Image Container */}
                        <div 
                          onClick={() => setPreviewImage({ src: item.imgSrc, title: item.title, subtitle: item.subtitle, desc: item.desc })}
                          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 mt-4 group/img cursor-pointer shadow-inner"
                        >
                          <img loading="lazy" decoding="async" 
                            src={item.imgSrc} 
                            alt={item.title} 
                            className="w-full h-full object-contain p-1.5 transition-transform duration-500 group-hover/img:scale-105" 
                            referrerPolicy="no-referrer"
                          />

                          {/* Hover Zoom Overlay */}
                          <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                            <ZoomIn className="w-8 h-8 text-white drop-shadow-md mb-1 animate-bounce" />
                            <span className="text-xs font-black bg-zinc-950/80 px-3 py-1 rounded-full border border-white/20 tracking-wider">
                              點擊放大檢視細節
                            </span>
                          </div>

                          {/* Bottom corner zoom badge */}
                          <div className="absolute bottom-2 right-2 bg-zinc-950/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 group-hover/img:bg-[#8e7a64] transition-colors">
                            <Maximize2 className="w-3 h-3" />
                            <span>放大預覽</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* New Locations Horizontal Address Cards (全台服務門市) */}
          <section id="locations-banner" className="relative bg-white select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center pb-12">
              <div className="w-full grid grid-cols-1 md:grid-cols-4 border border-zinc-200/60 bg-white shadow-xl rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                {/* Branch Header block */}
                <div className="bg-zinc-900 text-white p-6 flex flex-col justify-center text-center md:text-left select-none">
                  <span className="font-black text-lg md:text-xl tracking-widest mb-1 text-white">全台三間門市</span>
                  <span className="font-extrabold text-[10px] md:text-xs text-[#a8927a] tracking-widest uppercase">北中南 ｜ 專業服務</span>
                </div>

                {/* Taipei Branch Block */}
                <div className="p-5 flex items-center justify-between bg-white hover:bg-zinc-50/60 transition-colors">
                  <div className="text-left space-y-1">
                    <span className="font-black text-base text-zinc-900 block">台北店</span>
                    <span className="text-zinc-500 text-xs font-bold block">
                      台北市大安區忠孝東路四段112號11F-13
                    </span>
                  </div>
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-200 shadow-sm shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/台北店.webp" 
                      alt="台北店沙龍室" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Taichung Branch Block */}
                <div className="p-5 flex items-center justify-between bg-white hover:bg-zinc-50/60 transition-colors">
                  <div className="text-left space-y-1">
                    <span className="font-black text-base text-zinc-900 block">台中店</span>
                    <span className="text-zinc-500 text-xs font-bold block">
                      台中市西屯區台灣大道二段906號2樓
                    </span>
                  </div>
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-200 shadow-sm shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=140&h=100&q=80" 
                      alt="台中店沙龍室" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Kaohsiung Branch Block */}
                <div className="p-5 flex items-center justify-between bg-white hover:bg-zinc-50/60 transition-colors">
                  <div className="text-left space-y-1">
                    <span className="font-black text-base text-zinc-950 block">高雄店</span>
                    <span className="text-zinc-500 text-xs font-bold block">
                      高雄市橋頭區仕豐南路仕龍西巷10號
                    </span>
                  </div>
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-200 shadow-sm shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/高雄店.webp" 
                      alt="高雄店沙龍室" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Special Hotline block */}
              <div className="mt-5 flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-300">
                <Phone className="w-4 h-4 text-[#8e7a64] animate-bounce" />
                <span className="text-zinc-600 font-extrabold text-xs sm:text-sm tracking-widest">預約 / 諮詢專線：</span>
                <a href="tel:0909056036" className="text-[#8e7a64] font-black text-sm sm:text-base hover:underline tracking-wider">0909-056-036</a>
              </div>
            </div>
          </section>

          {/* Custom Process Section */}
          <section id="custom-process" className="py-16 md:py-20 bg-[#faf9f6] border-y border-zinc-150 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12 select-none">
                <span className="text-xs font-black text-[#8e7a64] bg-[#8e7a64]/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
                  CUSTOMIZATION PROCESS
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
                  量身訂製專區
                </h2>
                <p className="text-[#8e7a64] text-sm sm:text-base font-bold mb-2">專屬於您的完美假髮</p>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium">
                  依頭型、髮流、臉型量身設計，打造最自然、最舒適的專屬假髮
                </p>
              </div>

              {/* 4 Horizontal Steps Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {[
                  { title: "1 專業諮詢", desc: "了解需求與期望", img: "/images/諮詢.jpg" },
                  { title: "2 精準量模", desc: "頭型數據精準測量", img: "/images/量頭模.png" },
                  { title: "3 手工訂製", desc: "專業製作，品質把關", img: "/images/手工.png" },
                  { title: "4 修剪髮型", desc: "精緻修剪，自然滿意", img: "/images/修剪.png" }
                ].map((step, idx) => (
                  <div 
                    key={idx} 
                    className="relative bg-white border border-zinc-200/60 rounded-2xl pt-2.5 pb-4 px-3.5 flex flex-col items-center justify-between shadow-sm hover:shadow-md hover:border-[#8e7a64]/50 transition-all duration-300 text-center group cursor-zoom-in"
                    onMouseEnter={() => setHoveredStepIdx(idx)}
                    onMouseLeave={() => setHoveredStepIdx(null)}
                  >
                    <div className="w-full -mt-0.5 md:-mt-1">
                      <span className="font-black text-sm md:text-base text-zinc-900 block">{step.title}</span>
                      <span className="text-zinc-500 text-[10px] md:text-xs font-bold block mt-1 leading-tight">{step.desc}</span>
                    </div>
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50/50 shadow-inner mt-4 flex items-center justify-center relative">
                      <img loading="lazy" decoding="async" 
                        src={step.img} 
                        alt={step.title} 
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                      {/* Interactive Hover Hint Badge */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-xs tracking-wider flex items-center gap-1 shadow-sm">
                          🔍 滑鼠懸停放大
                        </span>
                      </div>
                    </div>
                    {/* Arrow for Desktop */}
                    {idx < 3 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-[#8e7a64] font-black pointer-events-none">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}

                    {/* Floating Zoom Popover */}
                    <AnimatePresence>
                      {hoveredStepIdx === idx && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1.05, y: -10 }}
                          exit={{ opacity: 0, scale: 0.9, y: 15 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="absolute bottom-[102%] left-1/2 -translate-x-1/2 z-50 w-[260px] sm:w-[320px] bg-white border border-[#e8dfd0] rounded-2xl shadow-2xl p-2.5 pointer-events-none select-none flex flex-col items-center"
                        >
                          <div className="w-full aspect-[4/3] bg-zinc-50/50 rounded-xl overflow-hidden border border-zinc-100 flex items-center justify-center p-1.5 shadow-inner">
                            <img loading="lazy" decoding="async" 
                              src={step.img} 
                              alt={step.title} 
                              className="w-full h-full object-contain rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="mt-2.5 text-zinc-800 font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 px-1 tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#8e7a64] animate-pulse"></span>
                            {step.title} (放大預覽)
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Portal Navigation Grid on Home Page */}
          <section className="py-16 bg-white border-t border-zinc-150 relative select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12 select-none">
                <span className="text-xs font-black text-[#8e7a64] bg-[#8e7a64]/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
                  SERVICES & PORTAL
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tight liquid-glass-heading inline-block">
                  探索大衛假髮各項服務
                </h2>
                <p className="text-zinc-650 text-sm sm:text-base font-bold text-zinc-600">請選擇您感興趣的專區，開啟專屬的獨立介紹頁：</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "品牌故事",
                    desc: "髮友自營，台灣唯一授權代理商，初衷與品質承諾。",
                    icon: BookHeart,
                    target: "brand-story"
                  },
                  {
                    title: "男性假髮專區",
                    desc: "全真人髮手工鉤織，客製白髮、髮色、密度，還原自然。",
                    icon: Scissors,
                    target: "mens-catalog"
                  },
                  {
                    title: "女性假髮專區",
                    desc: "頂級真絲手工大網增髮片與全罩式假髮，高顱頂蓬鬆美學。",
                    icon: Sparkles,
                    target: "womens-catalog"
                  },
                  {
                    title: "化療/醫療專區",
                    desc: "防敏吸附物理底網，陪伴落髮與新生的五步舒心服務。",
                    icon: Heart,
                    target: "chemo-catalog"
                  },
                  {
                    title: "常見問答 FAQ",
                    desc: "價格、品質、售後服務等常見疑慮與大衛哥誠實解答。",
                    icon: CheckCircle2,
                    target: "faq"
                  },
                  {
                    title: "真實顧客好評案例",
                    desc: "數百位髮友配戴反饋、日常運動、洗剪、隱私包廂感受。",
                    icon: Star,
                    target: "cases"
                  },
                  {
                    title: "假髮文章",
                    desc: "醫療假髮照護知識、手鉤工藝、配戴保養技巧專欄。",
                    icon: AtSign,
                    target: "blog"
                  },
                  {
                    title: "全台服務門市",
                    desc: "台北、台中、高雄實體預約制店面及特約設計師據點。",
                    icon: MapPin,
                    target: "locations"
                  }
                ].map((portal, idx) => (
                  <motion.div
                    key={portal.target}
                    onClick={() => {
                      setCurrentView(portal.target as any);
                      setActiveTab(portal.target);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    whileHover={{ y: -6 }}
                    className="p-6 bg-white rounded-2xl border border-zinc-200/80 hover:border-[#8e7a64] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between text-left group"
                  >
                    <div>
                      <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center mb-5 text-[#8e7a64] group-hover:bg-[#8e7a64]/10 group-hover:text-[#8e7a64] transition-colors">
                        <portal.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-lg text-zinc-900 mb-2">{portal.title}</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm font-bold leading-relaxed mb-6">{portal.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 font-black text-xs text-[#8e7a64] group-hover:translate-x-1 transition-transform self-start">
                      <span>開啟專區</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* New Customer trust guarantee icons board (最下排的5個信任點) */}
          <section id="trust-bar" className="py-8 bg-[#fdfbf9] border-t border-zinc-150 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {[
                  { title: "真人案例見證", desc: "成就更多自信笑容", icon: ThumbsUp },
                  { title: "專業團隊服務", desc: "一對一諮詢 ． 量身規劃", icon: Scissors },
                  { title: "安心試戴體驗", desc: "現場試戴 ． 滿意再購買", icon: Smile },
                  { title: "售後保固服務", desc: "專業調整 ． 長期保固", icon: HeartHandshake },
                  { title: "隱私安心", desc: "個資保護 ． 放心諮詢", icon: ShieldCheck }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-[#8e7a64]/10 text-[#8e7a64] flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#8e7a64]" />
                    </div>
                    <div>
                      <span className="font-extrabold text-[11px] sm:text-xs text-zinc-900 leading-tight block">{item.title}</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold tracking-tight block mt-0.5 leading-none">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {currentView === 'brand-story' && (
        <>
          {renderSubpageHeader("品牌故事", "髮友自營，極致手鉤真人髮，更懂你的重獲新生之旅")}

          {/* New Customer trust guarantee icons board (最下排的5個信任點) */}
          <section id="trust-bar" className="py-8 bg-[#fdfbf9] border-y border-zinc-150 select-none mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {[
                  { title: "真人案例見證", desc: "成就更多自信笑容", icon: ThumbsUp },
                  { title: "專業團隊服務", desc: "一對一諮詢 ． 量身規劃", icon: Scissors },
                  { title: "安心試戴體驗", desc: "現場試戴 ． 滿意再購買", icon: Smile },
                  { title: "售後保固服務", desc: "專業調整 ． 長期保固", icon: HeartHandshake },
                  { title: "隱私安心", desc: "個資保護 ． 放心諮詢", icon: ShieldCheck }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#8e7a64]" />
                    </div>
                    <div>
                      <span className="font-extrabold text-[11px] sm:text-xs text-zinc-900 leading-tight block">{item.title}</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold tracking-tight block mt-0.5 leading-none">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Brand Story Section */}
          <section id="about" className="py-24 bg-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-50/30 -skew-x-12 transform translate-x-1/2 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:w-1/2"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
                      <BookHeart className="w-4 h-4" />
                      FOUNDER'S STORY
                    </div>
                  </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-zinc-900 mb-8 tracking-tight liquid-glass-heading inline-block">
                <TypewriterHeading text="髮友自營" className="block" hideCursor />
                <TypewriterHeading text="更懂你的需求" className="text-brand-600" delay={0.5} />
              </h2>
              
              <div className="space-y-6 text-base sm:text-lg text-zinc-600 leading-relaxed font-light">
                <EditableText
                  idKey="about-p1"
                  defaultText="我是David，也是一名家族遺傳雄性禿髮友。 多年前，我在臺灣一家連鎖品牌購買了我的第一頂假髮。當我開始佩戴假髮後，不僅改善了我的外貌也增加自信，整個人也顯得更有精神。當時我只是單純享受著佩戴假髮後對生活正向的改變，沒有意識到這將是我未來創業之路的開始。"
                  as="p"
                  className="break-words"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
                <EditableText
                  idKey="about-p2"
                  defaultText="一開始只是因為自己也有需求，便在下班時兼職銷售假髮黏貼膠帶。也因此在網上結識了許多和自己一樣使用髮片的髮友。這些髮友與我分享了他們的經驗 and 需求，也激勵我之後走上了創業的道路。"
                  as="p"
                  className="break-words"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
                <EditableText
                  idKey="about-p3"
                  defaultText="在我的第一頂假髮經過多次維修後，已經變得破舊不堪，而購買新假髮的高昂價格也讓我感到困擾。 我開始思考，是否有更好的替代方案？於是，我決定深入研究假髮的製作流程。 我學習如何製作頭模、選擇底網、髮質和鈎髮相關工藝。"
                  as="p"
                  className="break-words"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
                <EditableText
                  idKey="about-p4"
                  defaultText="我逐漸明白，我可以不再依賴假髮店，而是直接與假髮製作工廠合作。在眾多髮友的鼓勵和支持下，我在2020年辭去了工程師的工作，創立了魔髮倉庫工作室，開始經營髮片訂製業務，並於2025年設立台北門市-大衛假髮。"
                  as="p"
                  className="break-words"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
            >
              <div className="space-y-4 sm:pt-12">
                <div className="aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden shadow-sm relative group flex items-center justify-center border-2 border-zinc-50">
                  <div className="p-12 text-center">
                    <Scissors className="w-16 h-16 text-brand-500/20 mx-auto mb-4" />
                    <p className="text-zinc-300 font-bold uppercase tracking-widest text-xs">專注細節 ・ 頂級工藝</p>
                  </div>
                </div>
                <div className="aspect-square bg-brand-500 rounded-3xl flex flex-col items-center justify-center text-zinc-950 p-6 text-center shadow-xl">
                  <span className="text-4xl md:text-5xl font-black mb-2">2020</span>
                  <span className="font-bold tracking-widest uppercase text-xs md:text-sm">Brand Founded</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-square bg-zinc-800 rounded-3xl flex flex-col items-center justify-center text-brand-500 p-6 text-center shadow-xl">
                  <ThumbsUp className="w-12 h-12 mb-4" />
                  <span className="font-bold text-lg text-white">Hair Wearer<br/>Myself</span>
                </div>
                <div className="aspect-[4/5] bg-brand-50 rounded-3xl overflow-hidden shadow-sm relative group flex items-center justify-center border-2 border-brand-100">
                  <div className="p-12 text-center">
                    <Sparkles className="w-16 h-16 text-brand-500/20 mx-auto mb-4" />
                    <p className="text-brand-800/40 font-bold uppercase tracking-widest text-xs">自然輕盈 ・ 舒適無感</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-20 grid md:grid-cols-2 gap-12 text-lg text-zinc-600 leading-relaxed font-light">
            <div className="space-y-6">
              <div className="p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-3xl relative group overflow-hidden liquid-glass-panel">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <PackageSearch className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-start gap-2">
                  <span className="shrink-0 w-8 h-8 bg-brand-500 text-zinc-950 rounded-lg flex items-center justify-center text-sm">01</span>
                  <EditableText
                    idKey="about-origin-title"
                    defaultText="大衛假髮工作室的由來"
                    as="span"
                    isAdmin={isAdminUser}
                    isEditMode={isEditMode}
                    siteContent={siteContent}
                    onSave={handleSaveSiteContent}
                  />
                </h3>
                <EditableText
                  idKey="about-origin-text"
                  defaultText="名稱由來是我之前在澳洲的生活經歷，那時候工作需求常會去當地一家叫邦寧倉庫(Bunnings Warehouse)的五金行購買工具。裡面的工具商品很齊全，價格也很平價，有什麼問題詢問店員，也都可以得到專業的解答。"
                  as="p"
                  className="text-base sm:text-lg"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
                <EditableText
                  idKey="about-origin-quote"
                  defaultText="「我期許我可以在假髮領域中成為這樣子的商店，幫髮友解決各項疑難雜症。」"
                  as="p"
                  className="mt-4 italic text-brand-700 font-medium text-base sm:text-lg"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </div>

              <div className="p-6 sm:p-8 bg-zinc-900 text-zinc-300 rounded-3xl border border-zinc-800 relative group overflow-hidden liquid-glass-panel-dark">
                <h3 className="text-xl font-bold text-white mb-4 flex items-start gap-2">
                  <span className="shrink-0 w-8 h-8 bg-brand-500 text-zinc-950 rounded-lg flex items-center justify-center text-sm">03</span>
                  <EditableText
                    idKey="about-commitment-title"
                    defaultText="初衷與承諾"
                    as="span"
                    isAdmin={isAdminUser}
                    isEditMode={isEditMode}
                    siteContent={siteContent}
                    onSave={handleSaveSiteContent}
                  />
                </h3>
                <EditableText
                  idKey="about-commitment-text"
                  defaultText="我不只是提供髮片，更提供實際且正確的解決方案。 因為自己本身也是髮友，所以我深刻瞭解髮友們的需求，無論是在佩戴還是日後的保養，我都能提供最真實的經驗分享。"
                  as="p"
                  className="text-base sm:text-lg"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 sm:p-8 bg-brand-50 rounded-3xl border border-brand-100 relative overflow-hidden group liquid-glass-panel">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-32 h-32 text-brand-900" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4 flex items-start gap-2">
                  <span className="shrink-0 w-8 h-8 bg-brand-500 text-zinc-950 rounded-lg flex items-center justify-center text-sm">02</span>
                  <EditableText
                    idKey="about-agency-title"
                    defaultText="台灣唯一代理與品質承諾"
                    as="span"
                    isAdmin={isAdminUser}
                    isEditMode={isEditMode}
                    siteContent={siteContent}
                    onSave={handleSaveSiteContent}
                  />
                </h3>
                <EditableText
                  idKey="about-agency-text"
                  defaultText="大衛假髮是美國專業假髮品牌 Walker Tape 在台灣的唯一授權代理商。我創業的初衷是想提供高品質且來源透明的髮片與配件，讓髮友能以合適的價格享受國際頂級產品。"
                  as="p"
                  className="text-brand-900/80 text-base sm:text-lg"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </div>

              <div className="p-6 sm:p-8 bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 rounded-3xl relative group overflow-hidden liquid-glass-panel">
                <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-start gap-2">
                  <span className="shrink-0 w-8 h-8 bg-brand-500 text-zinc-950 rounded-lg flex items-center justify-center text-sm">04</span>
                  <EditableText
                    idKey="about-dev-title"
                    defaultText="目前的發展"
                    as="span"
                    isAdmin={isAdminUser}
                    isEditMode={isEditMode}
                    siteContent={siteContent}
                    onSave={handleSaveSiteContent}
                  />
                </h3>
                <EditableText
                  idKey="about-dev-text"
                  defaultText="2020年在高雄開設創始工作室，增加女性髮片和化療假髮選擇。並於2025年正式開立台北忠孝旗艦店，並在2026年開立台中西屯店，同時在中壢、台南等地都有長期合作的特約設計師據點。"
                  as="p"
                  className="text-base sm:text-lg"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </div>
              <EditableText
                idKey="about-foot-quote"
                defaultText="「我相信自信是最美麗的風景。大衛假髮將繼續為每位追求自信的人提供最好的支持。」"
                as="p"
                className="mt-4 text-base sm:text-lg italic text-zinc-500"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {currentView === 'about-us' && (
        <>
          {renderSubpageHeader("關於我們", "大衛假髮 David Hair Studio．品牌總覽、服務據點與聯絡方式")}

          {/* Company Quick Facts */}
          <section className="py-20 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
                <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 text-center">
                  <span className="block text-3xl font-black text-brand-900">2020</span>
                  <span className="text-xs font-bold text-brand-700 mt-1 block">品牌成立</span>
                </div>
                <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 text-center">
                  <span className="block text-3xl font-black text-brand-900">3</span>
                  <span className="text-xs font-bold text-brand-700 mt-1 block">全台服務據點</span>
                </div>
                <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 text-center">
                  <span className="block text-3xl font-black text-brand-900">100%</span>
                  <span className="text-xs font-bold text-brand-700 mt-1 block">全真人手工髮片</span>
                </div>
                <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 text-center">
                  <span className="block text-3xl font-black text-brand-900">全預約制</span>
                  <span className="text-xs font-bold text-brand-700 mt-1 block">一對一隱私服務</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: company info */}
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-3xl">
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">品牌簡介</h3>
                    <p className="text-zinc-600 leading-relaxed">
                      「魔髮倉庫工作室（大衛假髮）」成立於 2020 年，由髮友自營，專注於男性、女性與化療醫療假髮的量身訂製。我們是美國專業假髮品牌 Walker Tape 在台灣的唯一授權代理商，致力於提供品質透明、價格公開的手工訂製髮片服務。
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-3xl">
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">服務項目</h3>
                    <ul className="space-y-2 text-zinc-600">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" /> 男性客製化訂製髮片</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" /> 女性頂部增髮片與整頂假髮</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" /> 化療／醫療級低敏假髮</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" /> 假髮配件、耗材線上商城</li>
                    </ul>
                  </div>

                  <div className="p-6 sm:p-8 bg-zinc-900 text-zinc-300 rounded-3xl border border-zinc-800">
                    <h3 className="text-xl font-bold text-white mb-3">聯絡我們</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                        <a href="tel:0909056036" className="hover:text-brand-400 transition-colors">0909 056 036</a>
                      </li>
                      <li className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                        <a href="mailto:davidhair0723@gmail.com" className="hover:text-brand-400 transition-colors break-all">davidhair0723@gmail.com</a>
                      </li>
                      <li className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-brand-400 shrink-0" />
                        <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">官方 LINE @davidhair</a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right: service locations */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">服務據點</h3>
                  {[
                    { name: '大衛假髮 台北忠孝旗艦店', address: '106臺北市大安區仁愛里忠孝東路四段112號11F-13' },
                    { name: '大衛假髮 台中店', address: '台中市西屯區台灣大道二段906號2樓' },
                    { name: '大衛假髮 高雄橋頭創始店', address: '825高雄市橋頭區仕豐南路仕龍西巷10號' },
                  ].map((branch) => (
                    <div key={branch.name} className="p-5 bg-white border border-zinc-150 rounded-2xl shadow-sm flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-900">{branch.name}</p>
                        <p className="text-zinc-500 text-sm mt-0.5">{branch.address}</p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => { setCurrentView('locations'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-brand-400" />
                    查看門市地圖與預約資訊
                  </button>

                  <button
                    onClick={() => { setCurrentView('brand-story'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:border-brand-400 text-zinc-700 hover:text-brand-600 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <BookHeart className="w-4 h-4" />
                    閱讀創辦人品牌故事
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {currentView === 'brand-story' && (
        <>

      {/* Online Store Section */}
      <section id="shop" className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16"
          >
              <div className="max-w-3xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 text-zinc-700 text-sm font-bold">
                    <PackageSearch className="w-4 h-4" />
                    PRODUCT CATALOG
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-4 liquid-glass-heading inline-block">
                  <TypewriterHeading text="專業配件與耗材" />
                </h2>
                <div className="flex items-center gap-3 text-brand-600 mb-8">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 fill-brand-500/10" />
                  <span className="text-2xl md:text-4xl font-black tracking-tighter">
                    WALKER TAPE <span className="text-zinc-900">台灣唯一授權代理商</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-brand-600 font-bold bg-brand-50 px-4 py-2 rounded-full border border-brand-100">
                實體門市現貨・LINE 諮詢即刻訂購
              </div>
          </motion.div>



          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 p-6 md:p-10 bg-zinc-900 rounded-[2rem] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h4 className="text-white text-xl md:text-2xl font-black mb-4">
                <EditableText
                  idKey="shop-banner-title"
                  defaultText="需要購買相關耗材？歡迎直接與我們聯繫"
                  as="span"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </h4>
              <EditableText
                idKey="shop-banner-desc"
                defaultText="身為 Walker Tape 台灣唯一授權代理商，我們保證所有商品皆為美國原廠進口。邀請您透過官方 LINE 直接訂購，我們將提供最專業的產品建議與更實惠的價格方案。"
                as="p"
                className="text-zinc-400 mb-8 max-w-2xl mx-auto font-light"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="bg-brand-500 hover:bg-brand-400 text-zinc-950 px-8 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2">
                  透過 LINE 洽詢訂購
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>




      {/* COMPARISON CHALLENGE SECTION */}
      <section id="comparison" className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8 italic liquid-glass-heading-dark inline-block">
              <TypewriterHeading text="為什麼要忍受" hideCursor />
              <br />
              <span className="text-brand-500">
                <TypewriterHeading text="不合理的昂貴？" delay={0.6} />
              </span>
            </h2>
            <EditableText
              idKey="compare-tagline"
              defaultText="大衛哥品牌核心：透明、真實、拒絕暴利。"
              as="p"
              className="text-xl text-white/50 max-w-2xl mx-auto font-medium"
              isAdmin={isAdminUser}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={handleSaveSiteContent}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            {/* The Old Way */}
            <div className="bg-zinc-950 p-12 lg:p-20 opacity-50 hover:opacity-100 transition-opacity text-left">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-3xl font-black text-white">傳統連鎖名店</h3>
              </div>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-1">天價預算</p>
                    <p className="text-white/40">5萬至10萬元起，常伴隨多種隱性加價。</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-1">諮詢壓力</p>
                    <p className="text-white/40">專業業務強力推銷，甚至一次需花費多頂費用。</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* The David Way */}
            <div className="bg-zinc-900 p-12 lg:p-20 relative text-left">
              <div className="absolute top-0 right-0 bg-brand-500 text-zinc-950 font-black px-8 py-2 rounded-bl-3xl transform translate-x-2 -translate-y-2">
                推薦首選
              </div>
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-zinc-950" />
                </div>
                <h3 className="text-3xl font-black text-white">大衛哥真髮訂製</h3>
              </div>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  </div>
                  <div>
                    <p className="text-brand-500 font-black mb-1">不到一半的預算</p>
                    <p className="text-white/80">透明化定價，同樣頂級工藝，價格僅需一半。</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  </div>
                  <div>
                    <p className="text-brand-500 font-black mb-1">髮友式服務</p>
                    <p className="text-white/80">David哥親自接待，站在同路人的立場解決問題。</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Features */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <EditableText
                idKey="craft-title"
                defaultText="完全客製，打造專屬完美比例"
                as="span"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
            </h2>
            <EditableText
              idKey="craft-desc"
              defaultText="我們傾聽您的需求，運用頂級材質與細膩手工，客製每一個細節，讓髮片比真髮更自然。"
              as="p"
              className="text-lg text-zinc-600"
              isAdmin={isAdminUser}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={handleSaveSiteContent}
            />
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[ 
              { icon: <Scissors className="w-7 h-7" />, title: "全真人髮手工鈎織", desc: "嚴選100%優質真人髮絲，純手工一針一線精細鈎織於微孔網底，髮絲靈動自然，可自由梳理造型。" },
              { icon: <Sparkles className="w-7 h-7" />, title: "客製髮量密度、髮色與白髮量", desc: "黑色、自然黑、自然色，或是因應年紀需求融入自然比例的白髮點綴，皆可完美調配零色差。" },
              { icon: <Ruler className="w-7 h-7" />, title: "密度與頭旋方向", desc: "精準還原您原生的頭旋位置與髮流走向，並可依個人喜好與年齡調整適合的髮量密度，拒絕厚重假感。" },
              { icon: <ShieldCheck className="w-7 h-7" />, title: "隱形透氣網面設計", desc: "採用極薄親膚仿生網底，夏季出汗不悶熱，高強度貼合頭皮，運動、游泳皆安穩無憂。" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-zinc-800 to-zinc-950 text-brand-500 rounded-xl flex items-center justify-center mb-6 shadow-md border border-zinc-700 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Selection Guide Section */}
      <section id="guide" className="py-24 bg-zinc-50 relative border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <EditableText
                idKey="guide-title"
                defaultText="為自己選擇出最適合的假髮"
                as="span"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
            </h2>
            <EditableText
              idKey="guide-desc"
              defaultText="在訂製假髮時，有許多細節可以根據個人喜好與預算做調整。讓我們先來初步了解不同款式與工藝的差異。"
              as="p"
              className="text-lg text-zinc-600"
              isAdmin={isAdminUser}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={handleSaveSiteContent}
            />
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 liquid-glass-panel"
            >
              <h3 className="text-2xl font-bold text-center text-zinc-800 mb-6 border-b pb-4 border-zinc-100">網底選擇對照</h3>
              <img loading="lazy" decoding="async" src="/images/guide-nets.png" alt="網底選擇指南" className="w-full h-auto min-h-[300px] sm:min-h-0 rounded-xl shadow-sm object-contain bg-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 liquid-glass-panel"
            >
              <h3 className="text-2xl font-bold text-center text-zinc-800 mb-6 border-b pb-4 border-zinc-100">客製化細節拆解</h3>
              <img loading="lazy" decoding="async" src="/images/guide-details.jpg" alt="細節選擇指南" className="w-full h-auto min-h-[300px] sm:min-h-0 rounded-xl shadow-sm object-contain bg-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Core Focus */}
      <section id="pricing" className="py-24 bg-zinc-950 text-zinc-50 relative overflow-hidden">
        {/* Abstract background assets */}
        <div className="absolute -right-64 -top-64 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute -left-64 -bottom-64 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold mb-6 tracking-widest text-sm uppercase">
                挑戰全台最高性價比
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-white liquid-glass-heading-dark inline-block">
                <EditableText
                  idKey="price-main-head"
                  defaultText="頂尖工藝，極致平價收費"
                  as="span"
                  isAdmin={isAdminUser}
                  isEditMode={isEditMode}
                  siteContent={siteContent}
                  onSave={handleSaveSiteContent}
                />
              </h2>
              <EditableText
                idKey="price-main-text"
                defaultText="市面上同等級的量模訂製髮片動輒要價 5 萬至 8 萬元，並常依面積層層加價。大衛假髮被網友評為「最高CP值優良店家」，我們剔除龐大行銷與店面溢價，只需不到一半的平民預算，就能擁有超越同級的精緻髮片！"
                as="p"
                className="text-zinc-400 text-lg mb-10 leading-relaxed font-light break-words"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
              
              <ul className="space-y-5 mb-10">
                {[
                  "無隱藏費用，一口價格包到好",
                  "包含量模、專業店內設計師精剪 styling",
                  "提供專業維護及保養諮詢教學"
                ].map((item, i) => (
                   <motion.li 
                     key={i}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.2 }}
                     className="flex items-center gap-4"
                   >
                     <div className="bg-brand-500/20 p-1.5 rounded-full">
                       <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                     </div>
                     <span className="text-zinc-200 text-lg font-medium tracking-wide">{item}</span>
                   </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="lg:w-1/2 w-full max-w-lg mx-auto perspective-1000"
            >
              <motion.div 
                whileHover={{ scale: 1.02, translateY: -10 }}
                className="bg-gradient-to-b from-white to-zinc-50 text-zinc-900 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Popular Badge */}
                <div className="absolute top-6 right-0 bg-gradient-to-r from-brand-600 to-brand-400 text-white font-black px-8 py-2 shadow-xl transform rotate-45 translate-x-8 -translate-y-2 text-sm tracking-widest z-10 w-48 text-center">
                  極致性價比
                </div>
                
                <div className="border border-zinc-200 rounded-[1.7rem] pt-10 pb-10 px-8 md:px-12 relative bg-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>

                  <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-3 relative z-10">
                    <EditableText
                      idKey="loc-billing-t1"
                      defaultText="男生量模訂製髮片"
                      as="span"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </h3>
                  <EditableText
                    idKey="loc-billing-t2"
                    defaultText="不分尺寸大小、不分髮長、全客製化"
                    as="p"
                    className="text-[#8e7a64] text-base sm:text-lg font-black mb-6 relative z-10"
                    isAdmin={isAdminUser}
                    isEditMode={isEditMode}
                    siteContent={siteContent}
                    onSave={handleSaveSiteContent}
                  />

                  <div className="flex items-baseline gap-1 md:gap-2 mb-8 pb-8 border-b border-zinc-100 relative z-10">
                    <span className="text-xl md:text-2xl text-zinc-400 font-bold">NT$</span>
                    <span className="text-5xl sm:text-6xl md:text-7xl font-black text-zinc-900 tracking-tighter">26,000</span>
                  </div>
                  
                  <div className="space-y-6 mb-10 relative z-10">
                    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 p-5 rounded-2xl border border-zinc-200 shadow-inner">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-brand-600 tracking-wide">
                          <EditableText
                            idKey="loc-billing-t3"
                            defaultText="老客戶專屬回饋"
                            as="span"
                            isAdmin={isAdminUser}
                            isEditMode={isEditMode}
                            siteContent={siteContent}
                            onSave={handleSaveSiteContent}
                          />
                        </span>
                        <Sparkles className="w-5 h-5 text-brand-400" />
                      </div>
                      <EditableText
                        idKey="loc-billing-t4"
                        defaultText="二年內回購第二頂，即享超級特惠價"
                        as="p"
                        className="text-zinc-500 text-sm mb-4"
                        isAdmin={isAdminUser}
                        isEditMode={isEditMode}
                        siteContent={siteContent}
                        onSave={handleSaveSiteContent}
                      />
                      <div className="flex items-baseline gap-1 text-zinc-900">
                        <span className="text-lg text-zinc-500 font-bold">NT$</span>
                        <span className="text-4xl font-black tracking-tighter">21,500</span>
                      </div>
                    </div>
                  </div>

                  <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-5 rounded-2xl font-black text-lg transition-all hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 group relative z-10">
                    <MessageCircle className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
                    LINE 預約量模諮詢
                  </a>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Exquisite After-Sales & Reputation */}
      <section className="py-24 bg-white relative border-t border-zinc-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl text-brand-600 mb-6">
              <Star className="w-8 h-8 fill-brand-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <EditableText
                idKey="loc-aftersales-head"
                defaultText="平價消費，無價的尊榮售後"
                as="span"
                isAdmin={isAdminUser}
                isEditMode={isEditMode}
                siteContent={siteContent}
                onSave={handleSaveSiteContent}
              />
            </h2>
            <EditableText
              idKey="loc-aftersales-desc"
              defaultText="許多假髮店售出後便置之不理。而在大衛假髮，每一次的完成都是服務的開始。我們憑藉業界口碑第一的優良品質，為您保駕護航，讓您買得便宜，戴得安心。"
              as="p"
              className="text-lg text-zinc-600 font-medium leading-relaxed"
              isAdmin={isAdminUser}
              isEditMode={isEditMode}
              siteContent={siteContent}
              onSave={handleSaveSiteContent}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-center group liquid-glass-panel"
            >
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-brand-500 mb-6 group-hover:scale-110 transition-transform border border-zinc-100">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">店內設計師精緻裁剪</h3>
              <p className="text-zinc-600 font-light leading-relaxed">
                由大衛哥為您客製專屬頭模，並透過台北、台中、高雄門市的資深美髮造型設計師現場為您一對一量臉修型剪髮，達到宛若天生的自然髮流。
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-center group liquid-glass-panel"
            >
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-brand-500 mb-6 group-hover:scale-110 transition-transform border border-zinc-100">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">一對一保養教學</h3>
              <p className="text-zinc-600 font-light leading-relaxed">
                即使是新手也不必擔心，我們提供最詳細的配戴與清潔保養教學。手把手教會您如何延長髮片壽命，大幅降低後續維護成本。
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-center group liquid-glass-panel"
            >
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-brand-500 mb-6 group-hover:scale-110 transition-transform border border-zinc-100">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Line 終身線上顧問</h3>
              <p className="text-zinc-600 font-light leading-relaxed">
                購買絕不是結束！配戴期間遇到任何疑難雜症、不會抓造型或是膠捲使用問題，線上專屬顧問隨時為您解答，做您最強的後盾。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Production Process / Status */}
      <section id="process" className="py-24 bg-zinc-50 relative border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="交期與現貨資訊" />
            </h2>
            <p className="text-lg text-zinc-600 font-medium">從諮詢到配戴，為您提供最安心的服務體驗。</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-500">
                 <Clock className="w-40 h-40" />
               </div>
               <div className="relative z-10">
                 <span className="inline-block bg-zinc-900 text-white font-bold px-4 py-1.5 rounded-full text-sm mb-6 shadow-sm">極致完美方案</span>
                 <h3 className="text-3xl font-black text-zinc-900 mb-3">專屬量模訂製</h3>
                 <div className="text-brand-600 font-black text-2xl mb-6">交期約 3 個月</div>
                 <p className="text-zinc-600 leading-relaxed font-light text-lg">
                   為追求極致完美的客戶準備。從取模、設計、到海外工廠一針一線手工鉤織，嚴格把關每一道工序，等待是值得的。
                 </p>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-brand-50 to-white rounded-3xl p-10 shadow-xl shadow-brand-500/10 border border-brand-100 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-500 text-brand-900">
                 <PackageSearch className="w-40 h-40" />
               </div>
               <div className="relative z-10">
                 <span className="inline-block bg-brand-500 text-white font-bold px-4 py-1.5 rounded-full text-sm mb-6 shadow-sm">立即變身方案</span>
                 <h3 className="text-3xl font-black text-zinc-900 mb-3">高品質現貨</h3>
                 <div className="text-brand-600 font-black text-2xl mb-6">隨時備有多款尺寸</div>
                 <p className="text-zinc-600 leading-relaxed font-light text-lg">
                   急需改變造型的您不用等！我們隨時備有多款公版尺寸的優質現貨，現場試戴並由店內設計師一對一精緻修剪，滿意即可馬上帶回家。
                 </p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-zinc-50 relative overflow-hidden border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl text-brand-600 mb-6">
              <BookHeart className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="常見問答 FAQ" />
            </h2>
            <p className="text-lg text-zinc-600 font-medium">為您解答關於價格、品質與售後的種種疑惑。</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Q：髮片價格跟我之前買的便宜這麼多，品質會不會很糟？",
                a: "我賣的價格其實不算便宜，而是原本台灣髮片的價格貴得太離譜了。我初期一開始是打算到歐美的網站訂購髮片，那時候線上看價格所有訂製選項都用頂級，一頂做到好也才二萬六。只是後來看製造工廠也是在大陸，所以我才重新到大陸找工廠配合。"
              },
              {
                q: "Q：看相片感覺還不錯，收到髮片後會不會很爛的品質？",
                a: "以我目前代理的這間髮片工廠，本身價格並不是最便宜的，在大陸算中等價位。因為我當初找工廠時價格不是我的第一考量點，髮片品質才是我第一考慮的。那時在大陸也買了不少價格便宜、網上相片看起來也不錯的髮片，但收到髮片時，就想直接丟垃圾筒了。我目前代理的這家髮片是我收到品質我認為最好的，所以我才敢跟他簽約談代理。目前來我工作室看過的髮友也都認為品質比他們自己在戴的還好，也有髮友把我的髮片拿給魔髮部屋跟愛德蘭絲的設計師看過，設計師也都認為髮片的品質比他們自家髮片還要好。"
              },
              {
                q: "Q：是全真髮嗎？可以染燙嗎？",
                a: "整頂都是全真人頭髮，都可以做染燙沒問題的。我自己也有去給設計師燙過造型哦。"
              },
              {
                q: "Q：之後的剪髮及維修服務？",
                a: "關於剪髮的部分是目前較困擾的部分，因為我自己本身是不會剪的，當初有考慮去學剪髮但最後還是決定交給專業的設計師會較好。目前在台北、中壢、高雄都有配合的設計師，收到髮片後可以自行跟設計師聯絡預約時間剪髮。髮片修剪完後，之後自身頭髮的修剪就可以自己到你原本的髮片門市做修剪就好。維修的部分，之後也都可以送回原廠做補髮跟網底維修不用擔心哦。"
              },
              {
                q: "Q：之後訂製需要重新做頭模嗎？",
                a: "做好的頭模我都有請工廠幫我建檔保存，之後若沒有需要調整大小的話，可以照存檔的頭模製做就好不用重新做模哦。"
              },
              {
                q: "Q：如果風太大髮片會掉嗎？",
                a: "如果髮夾有夾好，膠帶有貼好，基本上不會有被吹走的困擾，不用太擔心。"
              },
              {
                q: "Q：髮片使用的髮夾搭飛機能通關嗎？",
                a: "經測試搭飛機使用髮夾通關沒有問題唷"
              },
              {
                q: "Q：訂製髮片，需要剃髮嗎？",
                a: "目前髮片固定方式如下：\n《夾式》\n《全黏貼式》\n《前黏後夾式》\n\n通常會根據您的髮量現況、平常使用習慣，來評估何種固定方式較適合您\n有些僅需剃除少量原生髮，不至於整個剃光\n相關細節都會在現場與您做溝通後再決定\n請不用擔心唷"
              }
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-bold text-zinc-900 pr-4">{faq.q}</h3>
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                    <ChevronRight className="w-4 h-4 text-brand-600 rotate-90" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-zinc-600 leading-relaxed font-light border-t border-zinc-50">
                  <p className="whitespace-pre-line">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>

          <div className="mt-16 p-8 bg-brand-500 rounded-3xl text-center shadow-xl border border-brand-400">
            <h4 className="text-xl font-black text-zinc-950 mb-4">還有其他想問的嗎？</h4>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="bg-zinc-950 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-500" />
                預約 David哥 線上諮詢
              </a>
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {currentView === 'cases' && (
        <>
          {renderSubpageHeader("真實顧客好評與案例分享", "數百位髮友的滿意配戴反饋，日常運動與隱私諮詢體驗實錄")}

          {/* Content Hub cross-link: 案例分享 lives under 內容專區 in the site's
              content taxonomy, so surface a way back to the article hub here. */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <button
              onClick={() => { setBlogEntryCategory('all'); setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              查看更多內容專區文章（主理人專欄／知識分享／最新消息）
            </button>
          </div>

          {/* Customer Feedback Section */}
      <section id="feedback" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl text-brand-600 mb-6">
              <MessageCircle className="w-8 h-8 fill-brand-500/20" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="真實顧客好評反饋" />
            </h2>
            <p className="text-lg text-zinc-600 font-medium">看見每位髮友找回自信後的笑容，是我們最自豪的時刻。</p>
          </motion.div>

          {/* Interactive Database Customer Reviews */}
          <Suspense fallback={<ViewLoadingFallback />}>
            <ReviewSystem />
          </Suspense>

          <div className="flex flex-col items-center mt-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-xl"
            >
              <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-zinc-900 hover:bg-zinc-800 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl group">
                <Star className="w-5 h-5 text-brand-500 animate-pulse" />
                也想重拾自信？立即諮詢預約
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Women's Catalog Section */}
      <section id="womens" className="py-24 bg-zinc-50 relative border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="女士假髮專區" />
            </h2>
            <p className="text-lg text-zinc-600">除了專業男性訂製，我們同樣提供多款絕美的頂級女性手工真絲增髮片與全覆蓋假髮造型選擇。</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100/80 flex flex-col items-center"
          >
            <img loading="lazy" decoding="async" src="/images/catalog-women.jpg" alt="女士假髮產品型錄" className="w-full h-auto sm:min-h-[500px] rounded-xl shadow-sm object-contain bg-white mb-8" />
            
            <div className="text-center w-full max-w-xl pb-4">
              <h3 className="font-extrabold text-2xl text-zinc-900 mb-4">專屬量頭訂製 ｜ 頂級真人Remy少女髮</h3>
              <p className="text-zinc-500 font-light text-sm leading-relaxed mb-8">
                完美解決頭頂分線變寬、扁塌、白髮或增豐厚髮等困擾。
              </p>
              
              <button
                type="button"
                onClick={() => {
                  setCurrentView('womens-catalog');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="inline-flex items-center gap-2.5 bg-[#8e7a64] hover:bg-[#7a6854] text-white px-8 py-4.5 rounded-2xl font-black text-base transition-all shadow-xl hover:shadow-[#8e7a64]/20 active:scale-95 group cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                開啟女士專區專屬列表頁 (Womens Catalog)
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Chemo / Medical Wigs Section (New) */}
      <section id="chemo" className="py-24 bg-white relative border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 select-none"
          >
            <div className="inline-flex items-center justify-center p-3 bg-rose-50 rounded-2xl text-rose-600 mb-6">
              <Heart className="w-8 h-8 fill-rose-500/10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="化療/醫療專用舒敏假髮專區" />
            </h2>
            <p className="text-lg text-zinc-600 max-w-3xl mx-auto font-medium leading-relaxed">
              我們深刻理解您正在經歷的脆弱過程，陪伴每一位法友在舒心、隱密且專業的陪伴下渡過落髮與新生階段。
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Beautiful supportive info */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 text-left space-y-6 select-none"
            >
              <div className="space-y-4">
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block">
                  medical grade & absolute privacy
                </span>
                <h3 className="text-2.5xl sm:text-3.5xl font-black text-zinc-900 leading-snug">
                  100% Remy 真人真髮 ． 專利物理自吸附底網工藝
                </h3>
                <p className="text-zinc-650 text-base font-normal leading-relaxed">
                  專為敏弱、化療落髮期頭皮研發。不使用任何微金屬或機械式扣夾摩擦刺激頭皮，採用物理真空自吸附工藝（穩固舒適不移位），全透氣大網孔，即使炎夏亦能透氣清爽。
                </p>
              </div>

              {/* 5 Steps workflow */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-zinc-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
                  化療/醫療假髮 5 部曲舒心服務流程
                </h4>
                
                <div className="relative border-l border-zinc-200 ml-3.5 pl-6 space-y-5 py-2">
                  {[
                    { step: "01", title: "LINE 預約與私密諮詢", desc: "加官方 LINE 預約，後台由專人溫柔安排一對一隱密諮詢空間（台北、台中門市為全隔音 VIP 包廂），隔絕外界打擾。" },
                    { step: "02", title: "頭型曲率精密倒模與皮膚防敏測試", desc: "大衛哥為您精密測量顱骨與耳位；大衛嫂提供 10 分鐘貼皮敏弱測試，保證 24 小時配戴不泛紅。" },
                    { step: "03", title: "100% 真人少女髮純手工精細鉤織", desc: "依照您健康時的髮流、白髮比例、頭旋密度，全手工精勾植髮，提供極佳高顱頂空氣感蓬鬆底層。" },
                    { step: "04", title: "現場配戴與特約資深美髮設計師精修裁剪", desc: "假髮抵達後，安排一對一包廂現場試戴，由專業特約設計師依臉型現場裁剪多層次貼心造型。" },
                    { step: "05", title: "終身售後調整與「愛心免費備用假髮」計畫", desc: "後期體重或新髮生長導致頭圍 ±1.5cm 變化時由大衛哥終身免費調校；並提供紫外線與銀離子雙殺菌之醫療備用假髮完全免費借用。" }
                  ].map((val, idx) => (
                    <div key={idx} className="relative group text-left">
                      <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-white border border-rose-200 text-rose-600 flex items-center justify-center font-black text-[10px] group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-colors shadow-sm">
                        {val.step}
                      </div>
                      <h5 className="font-extrabold text-zinc-900 text-base">{val.title}</h5>
                      <p className="text-zinc-500 text-xs mt-1 leading-relaxed font-normal">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empathy subsidy disclaimer banner */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-2 text-left">
                <p className="font-extrabold text-zinc-950 text-xs md:text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#8e7a64]" />
                  大衛特別說明 ｜ 關於醫療與政府輔具補助
                </p>
                <p className="text-zinc-650 text-xs font-normal leading-relaxed">
                  大衛假髮堅持定價透明、誠實不虛報，將所有成本與心思皆投入於最頂級 100% Remy 真人假髮與 1對1 包廂隱私服務上，因此目前<strong>不配合、不提供辦理</strong>任何政府或醫療機構之假髮輔具補助申請，敬請法友諒解。
                </p>
              </div>
            </motion.div>

            {/* Right side: Image and action button */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 flex flex-col items-center bg-zinc-50 rounded-3xl p-6 border border-zinc-150 shadow-sm select-none"
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 shadow-inner bg-white relative group">
                <img loading="lazy" decoding="async" 
                  src="/images/guide-nets.png" 
                  alt="大衛醫療假髮進口輕羽底網" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-[#8e7a64] border border-zinc-150">
                  📷 特寫：特製醫療防霉超透氣輕盈底網
                </div>
              </div>

              <div className="text-center w-full mt-6 space-y-4">
                <h4 className="font-extrabold text-xl text-zinc-900">溫柔關懷 ． 煥然新生</h4>
                <p className="text-zinc-500 font-light text-xs leading-relaxed max-w-sm mx-auto">
                  大衛哥與大衛嫂團隊，在舒適獨立的全隔音包廂內，提供包含舒心剃頭、底網適應微調與售後保養的全流程陪伴。
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('chemo-catalog');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-extrabold text-sm transition-all shadow-md hover:shadow-rose-600/10 active:scale-95 group cursor-pointer w-full justify-center"
                >
                  <HeartHandshake className="w-4.5 h-4.5 text-white animate-pulse" />
                  <span>開啟醫療化療專區款式頁 (Chemo Catalog)</span>
                  <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
        </>
      )}

      {currentView === 'locations' && (
        <>
          {renderSubpageHeader("全台門市資訊", "台北、台中、高雄實體工作室，全隱私空間 1對1 專屬預約服務")}

          {/* Locations Section (New) */}
      <section id="locations" className="py-24 bg-white relative border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl text-brand-600 mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight liquid-glass-heading inline-block">
              <TypewriterHeading text="全台門市資訊" />
            </h2>
            <p className="text-xl text-brand-600 font-bold bg-brand-50 inline-block px-6 py-2 rounded-full border border-brand-100">工作室採全預約制</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Taipei */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-100 shadow-md hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 opacity-5 text-zinc-900">
                <span className="text-9xl font-black uppercase">TPE</span>
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-6 relative z-10 flex items-center gap-3">
                <span className="w-3 h-10 bg-brand-500 rounded-full block"></span>
                台北門市
              </h3>
              <div className="space-y-4 text-zinc-700 relative z-10 w-full text-left">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">門市地址</div>
                    <EditableText
                      idKey="loc-tpe-addr"
                      defaultText="106臺北市大安區仁愛里忠孝東路四段112號11F-13"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-2">
                  <Clock className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">營業時間</div>
                    <EditableText
                      idKey="loc-tpe-hours"
                      defaultText="10:00 - 19:00"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Taichung */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-100 shadow-md hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 opacity-5 text-zinc-900">
                <span className="text-9xl font-black uppercase">TXG</span>
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-6 relative z-10 flex items-center gap-3">
                <span className="w-3 h-10 bg-brand-500 rounded-full block"></span>
                台中門市
              </h3>
              <div className="space-y-4 text-zinc-700 relative z-10 w-full text-left">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">門市地址</div>
                    <EditableText
                      idKey="loc-txg-addr"
                      defaultText="台中市西屯區台灣大道二段906號2樓"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-2">
                  <Clock className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">營業時間</div>
                    <EditableText
                      idKey="loc-txg-hours"
                      defaultText="10:00 - 19:00"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Kaohsiung */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-100 shadow-md hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 opacity-5 text-zinc-900">
                <span className="text-9xl font-black uppercase">KHH</span>
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-6 relative z-10 flex items-center gap-3">
                <span className="w-3 h-10 bg-zinc-900 rounded-full block"></span>
                高雄門市
              </h3>
              <div className="space-y-4 text-zinc-700 relative z-10 w-full text-left">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">門市地址</div>
                    <EditableText
                      idKey="loc-khh-addr"
                      defaultText="825高雄市橋頭區仕豐南路仕龍西巷10號"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-2">
                  <Clock className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-zinc-900 mb-1">營業時間</div>
                    <EditableText
                      idKey="loc-khh-hours"
                      defaultText="10:00 - 19:00 (每週三、四公休)"
                      as="span"
                      className="font-light text-lg block"
                      isAdmin={isAdminUser}
                      isEditMode={isEditMode}
                      siteContent={siteContent}
                      onSave={handleSaveSiteContent}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Google Map Branch Locator */}
          <Suspense fallback={<ViewLoadingFallback />}>
            <StoreMap />
          </Suspense>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-xl mb-6 font-medium text-zinc-700">為提供您最好的專屬諮詢，請務必透過官方 Line 留言預約來店。</p>
            <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group">
               <MessageCircle className="w-7 h-7" />
               官方 LINE 留言預約
               <span className="bg-white/20 px-3 py-1 rounded-lg ml-2 text-sm tracking-widest font-bold">@davidhair</span>
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )}
  {currentView === 'mens-catalog' && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <MensWigCatalog
            onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            isAdmin={isAdminUser}
            isEditMode={isEditMode}
            siteContent={siteContent}
            onSave={handleSaveSiteContent}
            onRequestLogin={() => setIsGlobalLoginModalOpen(true)}
          />
        </Suspense>
      )}
      {currentView === 'womens-catalog' && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <WomensWigCatalog
            onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            isAdmin={isAdminUser}
            isEditMode={isEditMode}
            siteContent={siteContent}
            onSave={handleSaveSiteContent}
            onRequestLogin={() => setIsGlobalLoginModalOpen(true)}
          />
        </Suspense>
      )}
      {currentView === 'chemo-catalog' && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <ChemoWigCatalog
            onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            isAdmin={isAdminUser}
            isEditMode={isEditMode}
            siteContent={siteContent}
            onSave={handleSaveSiteContent}
            onRequestLogin={() => setIsGlobalLoginModalOpen(true)}
          />
        </Suspense>
      )}

      {currentView === 'shop' && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <OnlineStore
            onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            isAdmin={isAdminUser}
            isEditMode={isEditMode}
            siteContent={siteContent}
            onSave={handleSaveSiteContent}
            onAddToCart={handleAddToCart}
          />
        </Suspense>
      )}

      {currentView === 'blog' && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <BlogSystem
            onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            initialCategory={blogEntryCategory}
            onNavigateToCases={() => { setCurrentView('cases'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
          />
        </Suspense>
      )}

      {currentView === 'faq' && (
        <>
          {renderSubpageHeader("常見問答 FAQ", "為您解答關於價格、品質與售後的種種疑惑。")}
          
          <section id="faq-subpage" className="py-24 bg-zinc-50 relative overflow-hidden border-t border-zinc-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-4">
                {[
                  {
                    q: "Q：髮片價格跟我之前買的便宜這麼多，品質會不會很糟？",
                    a: "我賣的價格其實不算便宜，而是原本台灣髮片的價格貴得太離譜了。我初期一開始是打算到歐美的網站訂購髮片，那時候線上看價格所有訂製選項都用頂級，一頂做到好也才二萬六。只是後來看製造工廠也是在大陸，所以我才重新到大陸找工廠配合。"
                  },
                  {
                    q: "Q：看相片感覺還不錯，收到髮片後會不會很爛的品質？",
                    a: "以我目前代理的這間髮片工廠，本身價格並不是最便宜的，在大陸算中等價位。因為我當初找工廠時價格不是我的第一考量點，髮片品質才是我第一考慮的。那時在大陸也買了不少價格便宜、網上相片看起來也不錯的髮片，但收到髮片時，就想直接丟垃圾筒了。我目前代理的這家髮片是我收到品質我認為最好的，所以我才敢跟他簽約談代理。目前來我工作室看過的髮友也都認為品質比他們自己在戴的還好，也有髮友把我的髮片拿給魔髮部屋跟愛德蘭絲的設計師看過，設計師也都認為髮片的品質比他們自家髮片還要好。"
                  },
                  {
                    q: "Q：是全真髮嗎？可以染燙嗎？",
                    a: "整頂都是全真人頭髮，都可以做染燙沒問題的。我自己也有去給設計師燙過造型哦。"
                  },
                  {
                    q: "Q：之後的剪髮及維修服務？",
                    a: "關於剪髮的部分是目前較困擾的部分，因為我自己本身是不會剪的，當初有考慮去學剪髮但最後還是決定交給專業的設計師會較好。目前在台北、中壢、高雄都有配合的設計師，收到髮片後可以自行跟設計師聯絡預約時間剪髮。髮片修剪完後，之後自身頭髮的修剪就可以自己到你原本的髮片門市做修剪就好。維修的部分，之後也都可以送回原廠做補髮跟網底維修不用擔心哦。"
                  },
                  {
                    q: "Q：之後訂製需要重新做頭模嗎？",
                    a: "做好的頭模我都有請工廠幫我建檔保存，之後若沒有需要調整大小的話，可以照存檔的頭模製做就好不用重新做模哦。"
                  },
                  {
                    q: "Q：如果風太大髮片會掉嗎？",
                    a: "如果髮夾有夾好，膠帶有貼好，基本上不會有被吹走的困擾，不用太擔心。"
                  },
                  {
                    q: "Q：髮片使用的髮夾搭飛機可以通關嗎？",
                    a: "經測試搭飛機使用髮夾通關沒有問題唷"
                  },
                  {
                    q: "Q：訂製髮片，需要剃髮嗎？",
                    a: "目前髮片固定方式如下：\n《夾式》\n《全黏貼式》\n《前黏後夾式》\n\n通常會根據您的髮量現況、平常使用習慣，來評估何種固定方式較適合您\n有些僅需剃除少量原生髮，不至於整個剃光\n相關細節都會在現場與您做溝通後再決定\n請不用擔心唷"
                  }
                ].map((faq, i) => (
                  <motion.details
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="font-bold text-zinc-900 pr-4">{faq.q}</h3>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                        <ChevronRight className="w-4 h-4 text-brand-600 rotate-90" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6 pt-2 text-zinc-600 leading-relaxed font-light border-t border-zinc-50">
                      <p className="whitespace-pre-line">{faq.a}</p>
                    </div>
                  </motion.details>
                ))}
              </div>

              <div className="mt-16 p-8 bg-brand-500 rounded-3xl text-center shadow-xl border border-brand-400">
                <h4 className="text-xl font-black text-zinc-950 mb-4">還有其他想問的嗎？</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="bg-zinc-950 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-brand-500" />
                    預約 David哥 線上諮詢
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t font-light border-zinc-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-12 gap-x-8 gap-y-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4">
              <div className="flex items-center gap-3 text-white mb-6">
                <div className="flex-shrink-0">
                  <img loading="lazy" decoding="async" src="/images/icon.png" alt="Logo" className="w-16 h-16 object-contain" />
                </div>
                <span className="font-black text-2xl tracking-wider">大衛假髮</span>
              </div>
              <p className="text-sm font-light leading-relaxed mb-6 max-w-sm">
                專業解決男性落髮、稀疏困擾。提供最高CP值的全真人手工訂製髮片，找回您失去的自信與青春。
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                   <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                   <a href="tel:0909056036" className="text-zinc-300 hover:text-brand-500 transition-colors">0909 056 036</a>
                </li>
                <li className="flex items-center gap-3">
                   <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                   <a href="mailto:davidhair0723@gmail.com" className="text-zinc-300 hover:text-brand-500 transition-colors break-all">davidhair0723@gmail.com</a>
                </li>
                <li className="flex items-start gap-3">
                   <Clock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                   <span>營業時間：10:00 - 19:00（全台門市皆採全預約制）</span>
                </li>
              </ul>
            </div>

            {/* 公司資訊 */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-bold mb-5 tracking-widest text-sm">公司資訊</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => { setCurrentView('about-us'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="hover:text-brand-500 transition-colors cursor-pointer text-left"
                  >
                    關於我們
                  </button>
                </li>
                <li>
                  <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">
                    聯絡我們
                  </a>
                </li>
              </ul>
            </div>

            {/* 顧客服務 */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-bold mb-5 tracking-widest text-sm">顧客服務</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => setDocModal('shipping')} className="hover:text-brand-500 transition-colors cursor-pointer text-left">運送政策</button>
                </li>
                <li>
                  <button onClick={() => setDocModal('returns')} className="hover:text-brand-500 transition-colors cursor-pointer text-left">退換貨政策</button>
                </li>
                <li>
                  <button
                    onClick={() => { setCurrentView('faq'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="hover:text-brand-500 transition-colors cursor-pointer text-left"
                  >
                    常見問答
                  </button>
                </li>
              </ul>
            </div>

            {/* 法律政策 */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-bold mb-5 tracking-widest text-sm">法律政策</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => setDocModal('privacy')} className="hover:text-brand-500 transition-colors cursor-pointer text-left">隱私權政策</button>
                </li>
                <li>
                  <button onClick={() => setDocModal('terms')} className="hover:text-brand-500 transition-colors cursor-pointer text-left">服務條款</button>
                </li>
              </ul>
            </div>

            {/* 內容專區 + 社群連結 */}
            <div className="col-span-2 md:col-span-2">
              <h4 className="text-white font-bold mb-5 tracking-widest text-sm">內容專區</h4>
              <ul className="space-y-3 text-sm mb-8">
                <li>
                  <button
                    onClick={() => { setBlogEntryCategory('all'); setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="hover:text-brand-500 transition-colors cursor-pointer text-left"
                  >
                    最新消息／知識分享
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setCurrentView('cases'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    className="hover:text-brand-500 transition-colors cursor-pointer text-left"
                  >
                    案例分享
                  </button>
                </li>
              </ul>
              <h4 className="text-white font-bold mb-4 tracking-widest text-sm">社群連結</h4>
              <div className="flex gap-3">
                <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:bg-brand-500 hover:text-zinc-950 transition-all shadow-lg" title="LINE">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61574763193928&locale=zh_TW" target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:bg-brand-500 hover:text-zinc-950 transition-all shadow-lg" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/sky43121/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:bg-brand-500 hover:text-zinc-950 transition-all shadow-lg" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-600">
            <p>&copy; {new Date().getFullYear()} 大衛假髮 David Hair Studio. All rights reserved.</p>
            <a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="mt-4 md:mt-0 bg-brand-500 hover:bg-brand-600 text-zinc-950 px-5 py-2 rounded-full text-xs font-black transition-colors shadow-lg">
              點此加入 LINE 線上客服
            </a>
          </div>
        </div>
      </footer>

      {/* Core Technology Image Lightbox Zoom Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-[250] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/90 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8e7a64] animate-pulse" />
                  <div className="flex flex-col text-left">
                    <h3 className="font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
                      <span>{previewImage.title}</span>
                      <span className="text-xs font-bold text-[#8e7a64] bg-[#8e7a64]/20 border border-[#8e7a64]/40 px-2 py-0.5 rounded-full">
                        {previewImage.subtitle}
                      </span>
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="關閉預覽"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Uncropped Image Area */}
              <div className="relative flex-1 bg-zinc-950 flex items-center justify-center p-3 sm:p-6 min-h-[280px] overflow-hidden group">
                <img loading="lazy" decoding="async"
                  src={previewImage.src}
                  alt={previewImage.title}
                  className="max-h-[58vh] sm:max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Detailed Explanation Footer */}
              <div className="p-5 sm:p-6 bg-zinc-900 border-t border-zinc-800 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-[#8e7a64] bg-[#8e7a64]/20 border border-[#8e7a64]/30 px-3 py-1 rounded-full uppercase">
                    四大核心技術細節解析
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">按 Esc 或點擊背景任意處可關閉</span>
                </div>
                <p className="text-zinc-200 font-extrabold text-sm sm:text-base leading-relaxed pt-1">
                  {previewImage.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy & Terms Modal overlay */}
      <AnimatePresence>
        {docModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDocModal(null)}
            className="fixed inset-0 bg-neutral-900/45 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="font-extrabold text-xl text-zinc-950 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-brand-600" />
                  {docModal === 'privacy' ? '大衛假髮 — 隱私權政策' :
                   docModal === 'terms' ? '大衛假髮 — 服務條款' :
                   docModal === 'shipping' ? '大衛假髮 — 運送政策' :
                   '大衛假髮 — 退換貨政策'}
                </h3>
                <button
                  onClick={() => setDocModal(null)}
                  className="w-10 h-10 rounded-full bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-zinc-600">
                {docModal === 'privacy' ? (
                  <>
                    <p className="font-medium text-zinc-900 text-base">
                      歡迎使用大衛假髮（以下稱「本品牌」）官方線上服務系統。我們極度重視顧客的個人隱私與資訊安全。本隱私權政策將說明我們如何收集、處理、利用及保護您的個人資料：
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">一、 個人資料之收集目的</h4>
                        <p>本網站、表單或對話管道收集之個人資料（包括但不限於聯絡電話、LINE 帳號、諮詢需求、日常相片等），僅用於提供客製化假髮專屬設計諮詢、預約來店服務確認，以及本品牌最新優惠、照護保養資訊發送與特定溝通，絕不用於無關之其他商業活動。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">二、 收集的個人資料類型</h4>
                        <p>經您主動提供，我們可能收集您的姓名、聯絡電話、LINE 聯絡資訊、因個案客製需求發送之日常生活照片或局部脫髮面積照（用以在到店前進行髮量、面積與髮型初步技術評估）。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">三、 資料的使用期限、地區及對象</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          <li><strong>期間：</strong>自您發起諮詢或預約之日起，至本品牌終止服務或您要求刪除為止。</li>
                          <li><strong>對象：</strong>僅由「大衛假髮」專屬設計師、專業顧問在職務範圍內妥善進行安全管理。</li>
                          <li><strong>保護：</strong>本品牌承諾絕不向任何非法定第三方或無關機構洩漏、出租、交易或出售您的個人資料與日常照片。</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">四、 資料安全防護措施</h4>
                        <p>本品牌採用合適的安全防護與防範機制（包含密碼保護、權限限制及定期維護），以防止您的個人隱私或客製敏感照片遭受未經授權的存取、竄改、洩漏或毀損。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">五、 您的個人資料權利</h4>
                        <p>您可隨時透過本網站聯絡電話或加入官方 LINE 帳號（<a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="text-brand-600 font-bold hover:underline">@davidhair</a>）向我們請求查詢、閱覽、補充、更正、停止收集處理利用或請求刪除您已提供的所有個人資料與評估照片。</p>
                      </div>
                    </div>
                  </>
                ) : docModal === 'terms' ? (
                  <>
                    <p className="font-medium text-zinc-900 text-base">
                      當您瀏覽本網站、使用線上服務或來店諮詢時，即代表您已閱讀、理解並完全同意接受以下服務條款之約束：
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">一、 店內專屬一對一全預約制</h4>
                        <p>為提供最尊榮的一對一顧客諮詢隱私體驗與假髮技術服務品質，大衛假髮台北、台中、高雄門市皆採取「全預約制」。敬請您按照約定的日期時間前來。如欲變更或取消您的預約，請於預定時間前 24 小時透過官方 LINE（<a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="text-brand-600 font-bold hover:underline">@davidhair</a>）完成通知變更，以利為您重新排程。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">二、 100% 真人髮專屬特殊性</h4>
                        <p>大衛假髮所提供之專業客製化產品，均屬全手工、100% 真人髮製作。每位顧客之頭型、脫髮面積、弧度與期望之頭髮密度皆存在獨特客製屬性。由專業設計師採集之頭型量模數據、量身打版等特定資料，一旦進入正式工廠打版與手工鉤編程序，即不可任由顧客單方面要求變更或退訂，客製化商品不適用七天鑑賞期之規定。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">三、 預算透明與定價原則</h4>
                        <p>本品牌秉持誠信透明原則，提供約為市價 1/2 的超高配戴CP值。不分面積大小加價、不強推無關的加價方案。所有詳細收費標準（依每位顧客選用之工藝、扣具或膠磁系統、配戴長度等特定要件）將於現場諮詢並確認後明碼立書，合約成立後即不收取任何額外隱藏費用。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">四、 技術免責聲明與效果呈現</h4>
                        <p>本網頁所呈現之任何配戴效果、影片保養分享、前後對比實錄或顧客心得反饋皆為客觀真實紀錄。然而，配戴與修整效果會因各人頭骨形狀、自體殘留髮量、挑選之成品工藝及後續保養清潔細心度而存在合理差異。所有服務承諾均以現場溝通並簽署之諮詢單條款為最終標準。</p>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">五、 條款之更新與修訂權力</h4>
                        <p>大衛假髮 (David Hair Studio) 保留隨時更新、變更、修改及終止本服務條款與相關品牌規範之權利，修改後條款一經公佈於本官方線上渠道即刻生效，不另行個別通知。</p>
                      </div>
                    </div>
                  </>
                ) : docModal === 'shipping' ? (
                  <>
                    <p className="font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                      ⚠️ 以下為預設範本內容，實際運送區域、運費與工期請大衛哥依門市實際作業方式確認後修改，正式上線前務必核對。
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">一、 配件商城出貨方式</h4>
                        <p>線上商城之假髮護理用品、耗材、膠帶等配件商品，訂單成立後將以宅配或超商取貨方式寄出，實際出貨時間依商品庫存狀況為準，出貨後將透過官方 LINE 通知您配送進度。</p>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">二、 客製化假髮商品</h4>
                        <p>客製化訂製髮片、假髮商品因涉及量身打版與手工鉤織工序，製作工期較長，實際完成時間將於門市諮詢並簽署訂製單時個別告知，恕不併入一般配件商城之出貨時效。</p>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">三、 運費計算</h4>
                        <p>運費將於購物車結帳頁面依照配送方式與地區自動試算，實際收費請以結帳頁面顯示金額為準。</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                      ⚠️ 以下為預設範本內容，實際退換貨天數、條件與費用請大衛哥依門市實際作業方式確認後修改，正式上線前務必核對。
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">一、 配件商城商品退換</h4>
                        <p>非客製化之一般配件、護理用品，若收到商品有瑕疵或運送過程損壞，請於收到商品後 7 日內透過官方 LINE（<a href="https://line.me/R/ti/p/@davidhair" target="_blank" rel="noreferrer" className="text-brand-600 font-bold hover:underline">@davidhair</a>）並附上照片與訂單編號聯繫我們協助處理，若因個人因素退貨，商品需保持全新未拆封狀態。</p>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">二、 客製化假髮商品</h4>
                        <p>客製化訂製髮片為依個人頭型、髮量與需求特別打版製作之商品，一旦進入生產程序即不適用七天鑑賞期，恕不接受退換貨，詳細規定請參閱本站服務條款。</p>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base mb-1">三、 售後問題聯繫窗口</h4>
                        <p>如對商品品質或訂單狀態有任何疑問，歡迎隨時透過官方 LINE 或電子信箱（davidhair0723@gmail.com）與我們聯繫，我們將盡快為您協助處理。</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-100 flex justify-end bg-zinc-50/50">
                <button
                  onClick={() => setDocModal(null)}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Custom Login Modal */}
      <AnimatePresence>
        {isGlobalLoginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsGlobalLoginModalOpen(false);
              setGlobalLoginError('');
              setGlobalLoginSuccessMessage('');
              setAdminUsername('');
              setAdminPassword('');
              setRegName('');
              setRegEmail('');
              setRegPhone('');
              setRegPassword('');
              setRegConfirmPassword('');
              setMemberEmail('');
              setMemberPassword('');
            }}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-3 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-100 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-[#fcfaf7]">
                <div className="flex flex-col items-start text-left">
                  <h3 className="font-extrabold text-sm text-zinc-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-600 animate-none shrink-0" />
                    {loginMode === 'member-login' && '大衛假髮 — 會員登入'}
                    {loginMode === 'member-register' && '大衛假髮 — 註冊新會員'}
                    {loginMode === 'admin-login' && '大衛假髮 — 員工/管理登入'}
                  </h3>
                  <p className="text-[9px] text-zinc-400 font-bold tracking-wider mt-0.5 uppercase">
                    {loginMode === 'member-login' && 'VIP Member Login'}
                    {loginMode === 'member-register' && 'Join VIP Member'}
                    {loginMode === 'admin-login' && 'System Management'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsGlobalLoginModalOpen(false);
                    setGlobalLoginError('');
                    setGlobalLoginSuccessMessage('');
                    setAdminUsername('');
                    setAdminPassword('');
                    setRegName('');
                    setRegEmail('');
                    setRegPhone('');
                    setRegPassword('');
                    setRegConfirmPassword('');
                    setMemberEmail('');
                    setMemberPassword('');
                  }}
                  className="w-7 h-7 rounded-full bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Modal Tabs Selector */}
              <div className="flex border-b border-zinc-100 bg-[#fcfaf7] text-xs">
                <button
                  onClick={() => {
                    setLoginMode('member-login');
                    setGlobalLoginError('');
                    setGlobalLoginSuccessMessage('');
                  }}
                  className={`flex-1 py-2.5 font-extrabold text-center border-b-2 transition-all cursor-pointer ${loginMode === 'member-login' ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-zinc-400 hover:text-zinc-600 bg-zinc-50/40'}`}
                >
                  會員登入
                </button>
                <button
                  onClick={() => {
                    setLoginMode('member-register');
                    setGlobalLoginError('');
                    setGlobalLoginSuccessMessage('');
                  }}
                  className={`flex-1 py-2.5 font-extrabold text-center border-b-2 transition-all cursor-pointer ${loginMode === 'member-register' ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-zinc-400 hover:text-zinc-600 bg-zinc-50/40'}`}
                >
                  加入會員
                </button>
                <button
                  onClick={() => {
                    setLoginMode('admin-login');
                    setGlobalLoginError('');
                    setGlobalLoginSuccessMessage('');
                  }}
                  className={`flex-1 py-2.5 font-extrabold text-center border-b-2 transition-all cursor-pointer ${loginMode === 'admin-login' ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-zinc-400 hover:text-zinc-600 bg-zinc-50/40'}`}
                >
                  特助後台
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-5 space-y-3.5">
                {globalLoginError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium leading-relaxed text-left">
                    {globalLoginError}
                  </div>
                )}
                {globalLoginSuccessMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-black leading-relaxed text-left">
                    {globalLoginSuccessMessage}
                  </div>
                )}

                {/* Member Login View */}
                {loginMode === 'member-login' && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!memberEmail || !memberPassword) {
                        setGlobalLoginError('請完整輸入帳號與密碼！');
                        return;
                      }
                      try {
                        setIsLoggingIn(true);
                        setGlobalLoginError('');
                        setGlobalLoginSuccessMessage('');
                        const loggedUser = await loginMember(memberEmail, memberPassword);
                        if (loggedUser) {
                          setGlobalLoginSuccessMessage(`登入成功！歡迎回來，尊貴的 VIP 會員 ${loggedUser.displayName}。`);
                          setTimeout(() => {
                            setIsGlobalLoginModalOpen(false);
                            setGlobalLoginSuccessMessage('');
                            setMemberEmail('');
                            setMemberPassword('');
                          }, 1500);
                        }
                      } catch (err: any) {
                        setGlobalLoginError(err.message || '登入失敗，請檢查電子信箱或密碼。');
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    className="space-y-4 font-sans text-left"
                  >
                    <div className="space-y-1.5 flex flex-col items-start w-full">
                      <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        電子信箱 Email
                      </label>
                      <input
                        type="email"
                        placeholder="請輸入會員註冊電子信箱"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col items-start w-full">
                      <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        密碼 Password
                      </label>
                      <input
                        type="password"
                        placeholder="請輸入您的密碼"
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500 animate-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-zinc-300 text-zinc-950 text-xs font-black rounded-xl duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shadow-brand-500/10 mt-6"
                    >
                      {isLoggingIn ? '驗證中...' : '會員安全登入'}
                    </button>

                    <div className="text-center mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('member-register');
                          setGlobalLoginError('');
                        }}
                        className="text-xs text-brand-600 font-bold hover:underline"
                      >
                        還不是會員？點此免費註冊加入
                      </button>
                    </div>
                  </form>
                )}

                {/* Member Register View */}
                {loginMode === 'member-register' && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
                        setGlobalLoginError('請完整填寫所有必填欄位！');
                        return;
                      }
                      if (regPassword.length < 6) {
                        setGlobalLoginError('安全密碼長度需至少 6 個字元！');
                        return;
                      }
                      if (regPassword !== regConfirmPassword) {
                        setGlobalLoginError('兩次輸入的密碼不一致，請重新檢查！');
                        return;
                      }
                      try {
                        setIsLoggingIn(true);
                        setGlobalLoginError('');
                        setGlobalLoginSuccessMessage('');
                        const newUser = await registerMember(regName, regEmail, regPhone, regPassword);
                        if (newUser) {
                          setGlobalLoginSuccessMessage(`註冊成功！恭喜您成為大衛假髮 VIP 會員！`);
                          setTimeout(() => {
                            setIsGlobalLoginModalOpen(false);
                            setGlobalLoginSuccessMessage('');
                            setRegName('');
                            setRegEmail('');
                            setRegPhone('');
                            setRegPassword('');
                            setRegConfirmPassword('');
                          }, 1500);
                        }
                      } catch (err: any) {
                        setGlobalLoginError(err.message || '註冊失敗，請重試。');
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    className="space-y-3 font-sans text-left max-h-[60vh] overflow-y-auto pr-1"
                  >
                    <div className="space-y-1 flex flex-col items-start w-full">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        真實姓名 / 暱稱 Name *
                      </label>
                      <input
                        type="text"
                        placeholder="請輸入您的姓名或稱呼"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col items-start w-full">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        電子信箱 Email *
                      </label>
                      <input
                        type="email"
                        placeholder="example@gmail.com (將做為登入帳號)"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col items-start w-full">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        聯絡電話 Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="請輸入您的手機號碼"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col items-start w-full">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        設定密碼 Password * (至少 6 碼)
                      </label>
                      <input
                        type="password"
                        placeholder="請設定登入密碼"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col items-start w-full">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        確認密碼 Confirm Password *
                      </label>
                      <input
                        type="password"
                        placeholder="請再次輸入密碼以確認"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        disabled={isLoggingIn}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-zinc-300 text-zinc-950 text-xs font-black rounded-xl duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shadow-brand-500/10 mt-4"
                    >
                      {isLoggingIn ? '註冊處理中...' : '註冊加入會員'}
                    </button>

                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('member-login');
                          setGlobalLoginError('');
                        }}
                        className="text-[11px] text-zinc-500 font-bold hover:underline"
                      >
                        已有帳號？點此切換回登入頁面
                      </button>
                    </div>
                  </form>
                )}

                {/* Administrator Login View */}
                {loginMode === 'admin-login' && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!adminUsername || !adminPassword) {
                        setGlobalLoginError('請完整輸入帳號與密碼！');
                        return;
                      }
                      try {
                        setIsLoggingIn(true);
                        setGlobalLoginError('');
                        setGlobalLoginSuccessMessage('');
                        const loggedUser = await loginWithAdminCredentials(adminUsername, adminPassword);
                        if (loggedUser) {
                          setGlobalLoginSuccessMessage(`密碼驗證成功！歡迎回來大衛哥，工作人員後台已解鎖。`);
                          setTimeout(() => {
                            setIsGlobalLoginModalOpen(false);
                            setGlobalLoginSuccessMessage('');
                            setAdminUsername('');
                            setAdminPassword('');
                          }, 1500);
                        }
                      } catch (err: any) {
                        setGlobalLoginError(err.message || '帳號或密碼錯誤，請重新輸入。');
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    className="space-y-4 font-sans text-left"
                  >
                    <div className="space-y-1.5 flex flex-col items-start w-full">
                      <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        帳號 Username
                      </label>
                      <input
                        type="text"
                        placeholder="請輸入超級管理者帳號"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        disabled={isLoggingIn}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col items-start w-full">
                      <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest text-left">
                        密碼 Password
                      </label>
                      <input
                        type="password"
                        placeholder="請輸入超級管理者密碼"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        disabled={isLoggingIn}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500 animate-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-zinc-300 text-zinc-950 text-xs font-black rounded-xl duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shadow-brand-500/10 mt-6"
                    >
                      {isLoggingIn ? '驗證中...' : '超級使用者登入'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Floating Controller Panel (Visual Content Editor) - Compact & Collapsible */}
      {isAdminUser && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] transition-all">
          {isAdminPanelCollapsed ? (
            <button
              type="button"
              onClick={() => setIsAdminPanelCollapsed(false)}
              className="bg-zinc-950/90 hover:bg-zinc-900 border border-amber-500/80 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>大衛管理</span>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            </button>
          ) : (
            <div className="bg-zinc-950/92 border border-amber-500/80 text-white px-3 py-2 rounded-2xl shadow-xl flex flex-wrap items-center gap-2 max-w-[94vw] md:max-w-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mr-1">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[11px] font-black text-amber-400 whitespace-nowrap">大衛幕僚</span>
              </div>
              <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${isEditMode ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'}`}
                >
                  {isEditMode ? '編輯：開' : '編輯：關'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLoadMembers();
                    setIsAdminMemberManagerOpen(true);
                  }}
                  className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-lg text-[11px] font-black transition-all cursor-pointer whitespace-nowrap"
                >
                  會員管理
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFetchAllOrders();
                    setIsAdminOrdersOpen(true);
                  }}
                  className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-lg text-[11px] font-black transition-all cursor-pointer whitespace-nowrap"
                >
                  訂單管理
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUser();
                    setIsEditMode(false);
                  }}
                  className="px-2 py-1 bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  登出
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminPanelCollapsed(true)}
                  title="收起管理條"
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer ml-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Self-Deletion Modal */}
      <AnimatePresence>
        {isSelfDeleteConfirmOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[220] flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-zinc-150 max-w-md w-full shadow-2xl p-8 relative overflow-hidden text-zinc-900"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
              <button
                type="button"
                onClick={() => {
                  if (!isLoggingIn) {
                    setIsSelfDeleteConfirmOpen(false);
                    setSelfDeleteSuccess(false);
                    setSelfDeleteError('');
                  }
                }}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {selfDeleteSuccess ? (
                <div className="flex flex-col items-center text-center mt-4 py-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-5 border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">帳號已成功註銷</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed px-2">
                    我們已從系統中移除您的會員資料，期待未來有機會再次為您服務。祝您有美好的一天！
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center mt-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 border border-red-100">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-black text-zinc-900 mb-2">確定要註銷會員帳號嗎？</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed px-2">
                    此動作將自大衛假髮系統中永久清除您的註冊電子信箱、姓名與聯絡資訊。帳號註銷後將無法復原。
                  </p>

                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 w-full text-left my-6 space-y-2">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-wider">即將被刪除的帳號</div>
                    <div className="text-xs font-bold text-zinc-800">{user.displayName || "尊榮貴賓"}</div>
                    <div className="text-[10px] font-medium text-zinc-500">{user.email}</div>
                  </div>

                  {selfDeleteError && (
                    <div className="text-red-550 text-xs font-bold bg-red-50 border border-red-150 p-2.5 rounded-xl w-full text-left mb-4">
                      {selfDeleteError}
                    </div>
                  )}

                  <div className="flex gap-4 w-full">
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      onClick={() => setIsSelfDeleteConfirmOpen(false)}
                      className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-2xl transition-all text-xs cursor-pointer"
                    >
                      取消保留
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsLoggingIn(true);
                          setSelfDeleteError('');
                          await handleDeleteMember(user.uid);
                          setSelfDeleteSuccess(true);
                          setTimeout(async () => {
                            setIsSelfDeleteConfirmOpen(false);
                            setSelfDeleteSuccess(false);
                            await logoutUser();
                          }, 3000);
                        } catch (err: any) {
                          setSelfDeleteError(err.message || "註銷失敗，請稍候再試。");
                        } finally {
                          setIsLoggingIn(false);
                        }
                      }}
                      disabled={isLoggingIn}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white font-black rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/15"
                    >
                      {isLoggingIn ? "處理中..." : "確定永久刪除"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Member Manager Modal - Compact & Refined */}
      <AnimatePresence>
        {isAdminMemberManagerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[220] flex items-center justify-center p-3 font-sans"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl border border-zinc-200 max-w-2xl w-full max-h-[75vh] shadow-2xl flex flex-col relative overflow-hidden text-zinc-900"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                <div className="text-left">
                  <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-brand-500" />
                    會員檔案管理系統
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-bold mt-0.5">
                    總註冊會員：{membersList.length} 位 ｜ 管理及註銷尊貴的 VIP 會員資料
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminMemberManagerOpen(false)}
                  className="w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search and refresh toolbar */}
              <div className="px-4 md:px-5 py-3 border-b border-zinc-100 flex flex-col sm:flex-row gap-2.5 justify-between items-center shrink-0 bg-white">
                <div className="w-full sm:max-w-xs relative">
                  <input
                    type="text"
                    placeholder="搜尋姓名、Email 或電話..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                  />
                  {memberSearchQuery && (
                    <button
                      onClick={() => setMemberSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-bold cursor-pointer"
                    >
                      清除
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLoadMembers}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200/50 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center transition-colors"
                >
                  <Clock className={`w-3.5 h-3.5 ${isLoadingMembers ? 'animate-spin' : ''}`} />
                  重新整理
                </button>
              </div>

              {/* Members Table */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                {isLoadingMembers ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 py-8">
                    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-zinc-500 text-xs font-bold animate-pulse">載入會員清單中...</span>
                  </div>
                ) : (
                  (() => {
                    const filtered = membersList.filter(m => {
                      const query = memberSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        m.displayName.toLowerCase().includes(query) ||
                        m.email.toLowerCase().includes(query) ||
                        m.phone.toLowerCase().includes(query)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-8">
                          <Smile className="w-8 h-8 stroke-1 mb-2" />
                          <p className="font-bold text-xs">未找到符合搜尋條件的會員</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-2">
                          <div className="col-span-5 text-left">會員基本資料</div>
                          <div className="col-span-3 text-left">手機號碼</div>
                          <div className="col-span-2 text-left">加入日期</div>
                          <div className="col-span-2 text-center">操作</div>
                        </div>

                        {filtered.map((member) => (
                          <motion.div
                            layout
                            key={member.uid}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-100 hover:border-zinc-200 p-3 rounded-xl transition-all"
                          >
                            <div className="col-span-5 text-left flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-brand-500/10 text-brand-700 font-black rounded-full flex items-center justify-center text-xs shrink-0">
                                {member.displayName ? member.displayName.charAt(0) : "V"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-zinc-900 text-xs truncate flex items-center gap-1">
                                  {member.displayName || "尊榮貴賓"}
                                  <span className="bg-brand-500/20 text-brand-700 text-[8px] font-black px-1 py-0.2 rounded uppercase">VIP</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{member.email}</div>
                              </div>
                            </div>

                            <div className="col-span-3 text-left">
                              <span className="text-[11px] font-bold text-zinc-700 md:hidden block mb-0.5">聯絡電話：</span>
                              <span className="text-xs font-mono font-bold text-zinc-700 bg-white px-1.5 py-0.5 rounded border border-zinc-150 inline-block md:bg-transparent md:border-none md:p-0">
                                {member.phone || "未提供"}
                              </span>
                            </div>

                            <div className="col-span-2 text-left">
                              <span className="text-[11px] font-bold text-zinc-400 md:hidden block mb-0.5">註冊時間：</span>
                              <span className="text-[11px] font-mono text-zinc-500">
                                {member.createdAt ? member.createdAt.slice(0, 10) : "無紀錄"}
                              </span>
                            </div>

                            <div className="col-span-2 text-center flex justify-end md:justify-center">
                              <MemberDeleteButton member={member} onDelete={handleDeleteMember} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Shopping Cart Badge */}
      <AnimatePresence>
        {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && !isCartOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-24 right-6 z-[65] p-4 bg-zinc-950 border-2 border-brand-500 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer group"
          >
            <ShoppingCart className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-brand-500 text-zinc-950 text-xs font-black font-sans h-6 w-6 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-md animate-none">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Immersive Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmittingOrder) {
                  setIsCartOpen(false);
                  setOrderSuccessId(null);
                }
              }}
              className="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm z-[220]"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] md:w-[500px] bg-white shadow-2xl z-[230] flex flex-col justify-between font-sans border-l border-zinc-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                <div className="text-left">
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-brand-600" />
                    <span>您的專屬購物車</span>
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold mt-0.5">
                    大衛哥頂級配品 ｜ 免運門檻已解鎖 🚛
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccessId(null);
                  }}
                  className="w-9 h-9 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {orderSuccessId ? (
                  /* Success Screen */
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-black text-zinc-900">🎉 下單成功！恭喜您</h4>
                    <p className="text-zinc-500 text-xs font-bold mt-2">
                      大衛哥已經收到您的頂級配品訂單。
                    </p>
                    
                    <div className="w-full bg-zinc-50 border border-zinc-150 rounded-2xl p-4 my-6 text-left">
                      <div className="flex justify-between items-center text-xs border-b border-zinc-100 pb-2 mb-2">
                        <span className="text-zinc-400 font-bold">訂單編號：</span>
                        <span className="font-mono font-black text-brand-600 select-all">{orderSuccessId}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 space-y-1.5 font-bold">
                        <p>👤 收件人姓名：{recipientName}</p>
                        <p>📞 聯絡電話：{recipientPhone}</p>
                        <p>📍 {deliveryMethod === '門市自取' ? '自取工作室' : '寄送地址'}：{deliveryMethod === '門市自取' ? storeSelection : recipientAddress}</p>
                        <p>💳 付款方式：{paymentMethod}</p>
                      </div>
                      {paymentMethod === '銀行轉帳' && (
                        <div className="mt-3 bg-brand-50/50 border border-brand-200/50 rounded-xl p-3 text-[10px] text-brand-800">
                          <p className="font-extrabold mb-1">🏦 轉帳帳戶資料：</p>
                          <p>銀行代碼：013 國泰世華銀行</p>
                          <p>匯款帳號：699-50-618725-9</p>
                          <p className="font-extrabold text-red-600 mt-1">⚠️ 請於匯款後透過 Line 傳送後五碼與大衛哥核對，以便第一時間為您安排出貨！</p>
                        </div>
                      )}
                    </div>

                    <p className="text-zinc-400 text-[10px] font-bold">
                      您可以至個人選單的「我的訂單」中隨時追蹤配送進度。
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setOrderSuccessId(null);
                      }}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-black text-xs cursor-pointer shadow-md mt-6 transition-all"
                    >
                      確認並關閉
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  /* Empty Cart */
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-12">
                    <ShoppingBag className="w-16 h-16 stroke-1 text-zinc-300 mb-3 animate-pulse" />
                    <p className="font-extrabold text-sm text-zinc-500">您的購物車目前是空的</p>
                    <p className="text-[10px] text-zinc-400 mt-1">趕快挑選幾款大衛哥嚴選的優質髮片耗材配件吧！</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setCurrentView('shop');
                      }}
                      className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-zinc-950 text-xs font-black rounded-full shadow-sm mt-6 cursor-pointer transition-all active:scale-95"
                    >
                      立即前往配件商城
                    </button>
                  </div>
                ) : !isCheckoutStep ? (
                  /* Cart Items Review */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-400 pb-2 border-b border-zinc-100">
                      <span>已選購配品 ({cart.reduce((sum, item) => sum + item.quantity, 0)} 件)</span>
                      <button 
                        onClick={() => setCart([])} 
                        className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        清空購物車
                      </button>
                    </div>
                    <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          className="flex items-center gap-3 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 p-3 rounded-2xl relative"
                        >
                          <img loading="lazy" decoding="async"
                            src={item.imgUrl}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-zinc-150"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-xs font-black text-zinc-900 truncate leading-snug">{item.title}</h4>
                            <p className="text-[10px] text-brand-600 font-extrabold mt-0.5 truncate bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                              {item.selectedSize} ｜ {item.selectedColor || '預設規格'}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs font-bold text-zinc-900 font-mono">NT$ {item.price.toLocaleString()}</span>
                              
                              {/* Quantity selectors */}
                              <div className="flex items-center bg-white border border-zinc-200 rounded-lg shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 cursor-pointer text-xs font-bold"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-mono font-black text-zinc-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 cursor-pointer text-xs font-bold"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer"
                            title="刪除商品"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Checkout Form Step */
                  <form onSubmit={handleSubmitOrder} className="space-y-4 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutStep(false)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-600 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        返回修改商品
                      </button>
                      <span className="text-xs font-extrabold text-brand-600">填寫寄送與取貨資訊</span>
                    </div>

                    {/* Delivery Method */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">配送與取貨方式</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: '宅配到府', label: '🚚 宅配到府 (免運)', desc: '直接配送至您的住家/公司' },
                          { id: '門市自取', label: '🏬 門市預約自取', desc: '到店付款/取貨，專人教學' }
                        ].map(method => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setDeliveryMethod(method.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              deliveryMethod === method.id 
                                ? 'border-brand-500 bg-brand-50/20 shadow-sm ring-1 ring-brand-500' 
                                : 'border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            <p className="text-xs font-black text-zinc-900">{method.label}</p>
                            <p className="text-[9px] text-zinc-400 font-bold mt-0.5">{method.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block mb-1">收件人姓名</label>
                        <input
                          type="text"
                          required
                          placeholder="請輸入收件人真實姓名"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block mb-1">聯絡電話</label>
                        <input
                          type="tel"
                          required
                          placeholder="請輸入手機號碼 (例：0912345678)"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      {deliveryMethod === '宅配到府' ? (
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block mb-1">收件地址</label>
                          <input
                            type="text"
                            required
                            placeholder="請填寫完整的中文收件地址"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block mb-1">選擇自取門市工作室</label>
                          <select
                            value={storeSelection}
                            onChange={(e) => setStoreSelection(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-brand-500 bg-white"
                          >
                            <option value="台北門市（台北市大安區忠孝東路四段112號11F-13）">台北門市（台北市大安區忠孝東路四段112號11F-13）</option>
                            <option value="台中門市（台中市西屯區台灣大道二段906號2樓）">台中門市（台中市西屯區台灣大道二段906號2樓）</option>
                            <option value="高雄門市（高雄市橋頭區仕豐南路仕龍西巷10號）">高雄門市（高雄市橋頭區仕豐南路仕龍西巷10號）</option>
                          </select>
                          <p className="text-[9px] text-brand-600 font-bold mt-1.5 leading-relaxed bg-brand-50 p-2 rounded-lg">
                            💡 大衛提示：門市自取不需要先付款！您可至門市現場看貨、諮詢與配戴滿意後再付款。下單後我們會有專人 Line 或電話與您約定具体到店時段。
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block mb-1">付款方式</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: '貨到付款', label: '💵 貨到付款 / 面交', desc: '宅配貨到收現 或 門市自取面交' },
                          { id: '銀行轉帳', label: '🏦 銀行轉帳付款', desc: '享優先排單快速出貨' }
                        ].map(pm => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              paymentMethod === pm.id 
                                ? 'border-brand-500 bg-brand-50/20 shadow-sm ring-1 ring-brand-500' 
                                : 'border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            <p className="text-xs font-black text-zinc-900">{pm.label}</p>
                            <p className="text-[9px] text-zinc-400 font-bold mt-0.5">{pm.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === '銀行轉帳' && (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1.5 text-zinc-700">
                        <p className="font-extrabold text-xs text-zinc-900 flex items-center gap-1">
                          <span>🏦 匯款指定帳戶資訊</span>
                        </p>
                        <div className="text-[11px] font-mono font-bold text-zinc-600 space-y-0.5 pl-1.5 border-l-2 border-brand-500">
                          <p>銀行：國泰世華銀行 (代碼 013)</p>
                          <p>帳號：699-50-618725-9</p>
                          <p>戶名：大衛假髮頂級配品專戶</p>
                        </div>
                        <p className="text-[9px] text-red-600 font-bold">
                          * 轉帳完畢後，請點擊 Line 諮詢客服回報您「匯款帳號後五碼」以利迅速對帳安排優先配送！
                        </p>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Footer Summary & Action */}
              {!orderSuccessId && cart.length > 0 && (
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-4 shrink-0">
                  <div className="space-y-1.5 text-xs font-bold text-zinc-600 text-left">
                    <div className="flex justify-between">
                      <span>商品小計 Subtotal</span>
                      <span className="font-mono text-zinc-900 font-bold">NT$ {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運費 Delivery</span>
                      <span className="text-emerald-600">NT$ 0 (大衛自營免運費優惠)</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-zinc-900 pt-2 border-t border-zinc-150">
                      <span>應付總額 Total</span>
                      <span className="font-mono text-brand-600">NT$ {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {!isCheckoutStep ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (user) {
                          setRecipientName(user.displayName || '');
                          setRecipientPhone((user as any).phone || (user as any).phoneNumber || '');
                        }
                        setIsCheckoutStep(true);
                      }}
                      className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-zinc-950 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-500/10 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      確認規格並前往結帳
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={isSubmittingOrder}
                      className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:bg-zinc-300 disabled:text-zinc-500"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>訂單上傳寫入中...</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-brand-500" />
                          <span>確認寄送資料，送出訂單</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Orders Modal */}
      <AnimatePresence>
        {isUserOrdersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 font-sans text-zinc-900"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] border border-zinc-150 max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col relative overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                    <ClipboardList className="w-5.5 h-5.5 text-brand-500" />
                    我的頂級配品訂單紀錄
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold mt-1">
                    追蹤您在大衛假髮購買的配件、耗材、專用膠帶等訂單狀態
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserOrdersOpen(false)}
                  className="w-9 h-9 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {loadingOrders ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-zinc-500 text-xs font-bold animate-pulse">載入您的訂單紀錄中...</span>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400">
                    <Smile className="w-12 h-12 stroke-1 mb-3 mx-auto" />
                    <p className="font-bold text-sm">目前尚無任何訂單紀錄哦！</p>
                    <button
                      onClick={() => {
                        setIsUserOrdersOpen(false);
                        setCurrentView('shop');
                      }}
                      className="mt-4 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-all border border-brand-200 cursor-pointer"
                    >
                      前往選購配件
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-zinc-150 rounded-2xl p-4 bg-zinc-50/50 hover:bg-zinc-50 transition-all space-y-3"
                      >
                        {/* Status Header */}
                        <div className="flex justify-between items-center text-xs font-bold border-b border-zinc-150 pb-2.5">
                          <div>
                            <span className="text-zinc-400">下單時間：</span>
                            <span className="text-zinc-700 font-mono">{order.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                          </div>
                          <div>
                            {order.status === 'pending' && <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">待處理</span>}
                            {order.status === 'processing' && <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">備貨中</span>}
                            {order.status === 'shipped' && <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">已出貨</span>}
                            {order.status === 'completed' && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">已完成</span>}
                            {order.status === 'cancelled' && <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">已取消</span>}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div className="text-left font-bold text-zinc-800">
                                <span>{item.title}</span>
                                <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded ml-1.5 inline-block">
                                  {item.selectedSize} ｜ {item.selectedColor || '預設'}
                                </span>
                              </div>
                              <span className="font-mono text-zinc-500 font-bold shrink-0">
                                NT$ {item.price.toLocaleString()} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total Footer */}
                        <div className="flex justify-between items-center text-xs font-bold pt-2.5 border-t border-zinc-150">
                          <span className="text-zinc-400">訂單編號：<span className="font-mono text-[10px] select-all font-black text-zinc-800">{order.id}</span></span>
                          <span className="text-sm font-black text-brand-600">總金額：NT$ {order.totalAmount?.toLocaleString()}</span>
                        </div>

                        {/* Quick Action Contact Button */}
                        <div className="flex justify-end pt-1">
                          <a
                            href={`https://line.me/R/ti/p/@davidhair?text=大衛哥您好！我想詢問我的配件訂單狀態。訂單編號：${order.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-black text-[#06C755] hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            透過 Line 詢問此訂單進度
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Orders Management Modal - Compact & Refined */}
      <AnimatePresence>
        {isAdminOrdersOpen && isAdminUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[220] flex items-center justify-center p-3 font-sans text-zinc-900"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl border border-zinc-200 max-w-3xl w-full max-h-[78vh] shadow-2xl flex flex-col relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                <div className="text-left">
                  <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-500" />
                    配件商城後台訂單管理系統
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-bold mt-0.5">
                    總訂單數：{adminOrders.length} 筆 ｜ 變更狀態即時同步至買家個人訂單
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminOrdersOpen(false)}
                  className="w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Toolbar */}
              <div className="px-4 md:px-5 py-2.5 border-b border-zinc-100 flex flex-col sm:flex-row gap-2.5 justify-between items-center shrink-0 bg-white">
                <p className="text-zinc-500 text-[11px] font-bold text-left">
                  💡 變更狀態為「已出貨」或「備貨中」，系統將自動同步買家訂單頁面。
                </p>
                <button
                  type="button"
                  onClick={handleFetchAllOrders}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200/50 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  重新整理
                </button>
              </div>

              {/* Orders Table/List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                {adminOrders.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400">
                    <ShoppingBag className="w-10 h-10 stroke-1 mb-2 mx-auto" />
                    <p className="font-bold text-xs">目前系統內尚無顧客訂單資料</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-zinc-200 rounded-xl p-3.5 bg-zinc-50/50 hover:bg-zinc-50 transition-all grid grid-cols-1 md:grid-cols-12 gap-3 items-start text-left"
                      >
                        {/* Column 1: Client details */}
                        <div className="md:col-span-4 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-zinc-900 text-xs">👤 {order.recipientName}</span>
                            <span className="bg-zinc-200 text-zinc-700 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                              {order.userId === 'guest_customer' ? '訪客' : 'VIP'}
                            </span>
                          </div>
                          <p className="text-xs font-mono font-bold text-zinc-600">📞 {order.recipientPhone}</p>
                          <p className="text-[11px] font-medium text-zinc-500 leading-snug">📍 {order.recipientAddress}</p>
                          <p className="text-[10px] text-zinc-400 truncate">📧 {order.userEmail}</p>
                        </div>

                        {/* Column 2: Order items details */}
                        <div className="md:col-span-5 space-y-1 border-t md:border-t-0 md:border-l md:border-r border-zinc-200 pt-2.5 md:pt-0 md:px-3">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">訂購品項</p>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-xs font-bold text-zinc-800 leading-tight">
                              <span className="text-zinc-900">{item.title}</span>
                              <span className="text-[9px] text-brand-600 bg-brand-50 px-1 py-0.2 rounded mx-1">{item.selectedSize}</span>
                              <span className="text-zinc-400">× {item.quantity}</span>
                            </div>
                          ))}
                          <div className="pt-1 text-xs font-black text-brand-600">
                            總額：NT$ {order.totalAmount?.toLocaleString()} 元 ｜ {order.paymentMethod}
                          </div>
                          <p className="text-[10px] font-mono text-zinc-400 pt-0.5">
                            時間：{order.createdAt?.replace('T', ' ').slice(0, 16)}
                          </p>
                        </div>

                        {/* Column 3: Order Status manager & Actions */}
                        <div className="md:col-span-3 flex flex-col gap-2 justify-between items-stretch h-full pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200">
                          <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">狀態更新</label>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-black border focus:outline-none ${
                                order.status === 'pending' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                                order.status === 'processing' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                                order.status === 'shipped' ? 'bg-indigo-50 border-indigo-300 text-indigo-800' :
                                order.status === 'completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                                'bg-rose-50 border-rose-300 text-rose-800'
                              }`}
                            >
                              <option value="pending">待處理</option>
                              <option value="processing">備貨準備中</option>
                              <option value="shipped">已出貨</option>
                              <option value="completed">已完成</option>
                              <option value="cancelled">已取消</option>
                            </select>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="px-2.5 py-1 border border-zinc-200 hover:border-red-200 text-zinc-400 hover:text-red-500 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer bg-white transition-colors"
                              title="刪除這筆訂單"
                            >
                              <Trash2 className="w-3 h-3" />
                              刪除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FolderOpen, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  CheckCircle,
  FileText,
  Sparkles,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  ImageOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType,
  loginWithAdminCredentials,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onAuthStateChanged
} from '../services/firebase';
import { BlogPost, defaultBlogs } from '../data/blogArticles';

export type { BlogPost };

interface BlogSystemProps {
  onBack: () => void;
  // Category to pre-select when arriving from the header's 內容專區 dropdown.
  // 'all' (the default) shows every article, matching the previous behavior.
  initialCategory?: string;
  // Navigates to the 案例分享 (customer case/testimonial) page. That content
  // lives in its own photo-gallery component (ReviewSystem) rather than as
  // blog posts, but conceptually belongs under 內容專區, so it's surfaced
  // here as one more tab alongside the blog categories.
  onNavigateToCases?: () => void;
}

export default function BlogSystem({ onBack, initialCategory = 'all', onNavigateToCases }: BlogSystemProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  // Keep the visible category in sync if the parent sends a new entry
  // category (e.g. clicking a different 內容專區 dropdown item while already
  // on the blog page re-renders this component with a new initialCategory).
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Admin states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);

  // Safe Custom Alert/Confirm States (avoid iframe window.alert/window.confirm blocks)
  const [modalAlert, setModalAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    type?: 'warning' | 'info' | 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showCustomAlert = (title: string, message: string, type: 'warning' | 'info' | 'error' | 'success' = 'info') => {
    setModalAlert({
      isOpen: true,
      title,
      message,
      type,
      showCancel: false,
    });
  };

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'error' | 'success' = 'warning') => {
    setModalAlert({
      isOpen: true,
      title,
      message,
      type,
      showCancel: true,
      onConfirm,
    });
  };

  // Admin login states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formAuthor, setFormAuthor] = useState('大衛哥');
  const [formReadTime, setFormReadTime] = useState('3 min');
  const [formImgUrl, setFormImgUrl] = useState('');
  // Cover Photo Option: 'random' = 系統推薦美圖, 'url' = 自訂網址, 'none' = 不使用封面照(純文字風格)
  const [coverOption, setCoverOption] = useState<'random' | 'url' | 'none'>('random');
  
  // Custom Category Creation
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [formTab, setFormTab] = useState<'edit' | 'preview'>('edit');

  // Listen to google auth state to dynamically set Admin privileges
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial blogs and categories from Firestore or fallback to localStorage / preloaded defaults
  const loadData = async () => {
    setLoading(true);
    let blogsData: BlogPost[] = [];
    let catsData: string[] = [];

    try {
      // 1. Fetch blogs
      const blogsSnapshot = await getDocs(collection(db, 'blogs')).catch(err => {
        handleFirestoreError(err, OperationType.GET, 'blogs');
      });
      if (blogsSnapshot) {
        blogsData = blogsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            category: data.category || '',
            excerpt: data.excerpt || '',
            author: data.author || '大衛哥',
            publishDate: data.publishDate || '',
            readTime: data.readTime || '3 min',
            imgUrl: data.imgUrl ?? ''
          } as BlogPost;
        });
        // Sort newest first
        blogsData.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
      }

      // 2. Fetch categories
      const catsSnapshot = await getDocs(collection(db, 'categories')).catch(err => {
        handleFirestoreError(err, OperationType.GET, 'categories');
      });
      if (catsSnapshot) {
        catsData = catsSnapshot.docs.map(doc => doc.data().name as string).filter(Boolean);
      }
    } catch (err) {
      console.warn("Using fallback local storage data because Firestore failed or skipped:", err);
      const localBlogs = localStorage.getItem('david_blogs');
      const localCats = localStorage.getItem('david_categories');
      
      if (localCats) {
        try {
          catsData = JSON.parse(localCats);
        } catch (e) {
          console.error(e);
        }
      }
      if (localBlogs) {
        try {
          blogsData = JSON.parse(localBlogs);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Default initializer if anything is empty
    if (!catsData || catsData.length === 0) {
      catsData = ["最新消息", "案例分享", "主理人專欄", "知識分享", "活動與公告"];
      try {
        if (auth.currentUser) {
          for (const cat of catsData) {
            await setDoc(doc(db, 'categories', 'cat-' + cat), { name: cat });
          }
        }
      } catch (err) {
        console.warn("Syncing defaults skipped:", err);
      }
    }

    // Fetch deleted blog IDs from local storage
    const deletedIdsRaw = localStorage.getItem('david_deleted_blogs');
    const deletedIds: Set<string> = new Set(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);

    if (!blogsData || blogsData.length === 0) {
      blogsData = defaultBlogs.filter(d => !deletedIds.has(d.id));
    } else {
      // Map default blogs by ID for merging updated fields
      const defaultBlogsMap = new Map(defaultBlogs.map(b => [b.id, b]));
      
      // Update existing default blogs with latest default definition if it's one of default blogs
      blogsData = blogsData.map(b => {
        if (defaultBlogsMap.has(b.id)) {
          const def = defaultBlogsMap.get(b.id)!;
          return { ...b, imgUrl: def.imgUrl };
        }
        return b;
      });

      const existingIds = new Set(blogsData.map(b => b.id));
      const missingDefaults = defaultBlogs.filter(d => !existingIds.has(d.id) && !deletedIds.has(d.id));
      if (missingDefaults.length > 0) {
        blogsData = [...missingDefaults, ...blogsData];
      }
      blogsData = blogsData.filter(b => !deletedIds.has(b.id));
      blogsData.sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));
    }
    
    localStorage.setItem('david_blogs', JSON.stringify(blogsData));
    localStorage.setItem('david_categories', JSON.stringify(catsData));
    
    setBlogs(blogsData);
    setCategories(catsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set initial category default in form
  useEffect(() => {
    if (categories.length > 0 && !formCategory) {
      setFormCategory(categories[0]);
    }
  }, [categories, formCategory]);

  const handleCreateOrUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim() || !formContent.trim()) {
      showCustomAlert('欄位未填寫完整', '請填寫文章標題與內容後再進行儲存。', 'warning');
      return;
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791136364-7286472b3153?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop'
    ];

    let finalImgUrl = '';
    if (coverOption === 'none') {
      finalImgUrl = '';
    } else if (coverOption === 'url') {
      finalImgUrl = formImgUrl.trim();
    } else {
      // random selection
      finalImgUrl = formImgUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    const finalExcerpt = formExcerpt.trim() || (formContent.replace(/[#*`\-]/g, '').slice(0, 100) + '...');

    const finalId = editingPost ? editingPost.id : 'blog-' + Date.now().toString();
    const payload = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      excerpt: finalExcerpt,
      author: formAuthor,
      publishDate: editingPost ? editingPost.publishDate : new Date().toISOString().split('T')[0],
      readTime: formReadTime,
      imgUrl: finalImgUrl,
    };

    const finalPost: BlogPost = {
      id: finalId,
      ...payload
    };

    // 1. Prepare fully operational local item
    let nextBlogs: BlogPost[] = [];
    if (editingPost) {
      nextBlogs = blogs.map(b => b.id === finalId ? finalPost : b);
    } else {
      nextBlogs = [finalPost, ...blogs];
    }

    setBlogs(nextBlogs);
    localStorage.setItem('david_blogs', JSON.stringify(nextBlogs));
    setIsFormOpen(false);
    setEditingPost(null);

    // 2. Perform write to Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'blogs', finalId), payload).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `blogs/${finalId}`);
        });
        console.log("Firestore upload successful.");
      } catch (err: any) {
        console.error("Save to DB failed:", err);
        showCustomAlert('連線 Firebase 寫入失敗', `錯誤: ${err.message || err}`, 'error');
      }
    } else {
      console.log("Local save successful. (Firestore write skipped because user is not authenticated as cloud admin)");
    }

    // Reset Form
    setFormTitle('');
    setFormContent('');
    setFormExcerpt('');
    setFormImgUrl('');
    setCoverOption('random');
    setFormReadTime('3 min');
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormCategory(post.category);
    setFormExcerpt(post.excerpt);
    setFormAuthor(post.author);
    setFormReadTime(post.readTime);
    setFormImgUrl(post.imgUrl || '');
    if (!post.imgUrl || post.imgUrl.trim() === '') {
      setCoverOption('none');
    } else {
      setCoverOption('url');
    }
    setFormTab('edit');
    setIsFormOpen(true);
  };

  const handleDeletePost = (id: string) => {
    showCustomConfirm(
      '確認要刪除這篇文章嗎？',
      '此動作將刪除該文章，且無法再進行復原。',
      async () => {
        // 1. Delete from Firestore FIRST so the deletion is actually persisted.
        // If this fails, we must NOT touch local state, otherwise the article
        // only disappears from this browser while still existing remotely,
        // and will reappear on refresh / other devices / for other visitors.
        if (auth.currentUser) {
          try {
            await deleteDoc(doc(db, 'blogs', id));
            console.log("Document successfully deleted from Firestore.");
          } catch (err: any) {
            console.error("Delete from Firestore failed:", err);
            showCustomAlert('刪除失敗', `錯誤: ${err.message || err}\n\n文章尚未被刪除，請稍後再試一次。`, 'error');
            return;
          }
        } else {
          console.log("Local delete successful. (Firestore deletion skipped under local preview mode)");
        }

        // 2. Now that the remote deletion succeeded (or we're in local-only
        // preview mode), update client-side state & record the deleted ID.
        const updatedBlogs = blogs.filter(b => b.id !== id);
        setBlogs(updatedBlogs);
        localStorage.setItem('david_blogs', JSON.stringify(updatedBlogs));

        try {
          const deletedIdsRaw = localStorage.getItem('david_deleted_blogs');
          const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
          if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('david_deleted_blogs', JSON.stringify(deletedIds));
          }
        } catch (e) {
          console.error("Failed to update deleted IDs list:", e);
        }

        if (selectedPost && selectedPost.id === id) {
          setSelectedPost(null);
        }
      },
      'warning'
    );
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIn = newCategoryInput.trim();
    if (!cleanIn) return;

    if (categories.some(c => c.toLowerCase() === cleanIn.toLowerCase())) {
      setCategoryError('此分類已存在。');
      return;
    }

    // 1. Client-side update
    const updatedCats = [...categories, cleanIn];
    setCategories(updatedCats);
    localStorage.setItem('david_categories', JSON.stringify(updatedCats));
    setFormCategory(cleanIn);
    setNewCategoryInput('');
    setCategoryError('');

    // 2. Sync to Firestore
    if (auth.currentUser) {
      try {
        // Safe doc ID key using timestamp
        const cleanId = 'cat-' + Date.now().toString();
        await setDoc(doc(db, 'categories', cleanId), { name: cleanIn }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `categories/${cleanId}`);
        });
        console.log("Added new category to Firestore.");
      } catch (err: any) {
        console.error("Firestore Category write error:", err);
        setCategoryError(`寫入分類失敗: ${err.message || err}`);
      }
    } else {
      console.log("Category added locally.");
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (blogs.some(b => b.category === catToDelete)) {
      showCustomAlert(
        '無法刪除分類',
        `無法刪除此分類「${catToDelete}」，因為仍有文章屬於此分類。請先修改對應的文章分類。`,
        'warning'
      );
      return;
    }

    showCustomConfirm(
      '確認要刪除該分類嗎？',
      `確定要刪除閱讀分類「${catToDelete}」嗎？`,
      async () => {
        // 1. Client-side update
        const updatedCats = categories.filter(c => c !== catToDelete);
        setCategories(updatedCats);
        localStorage.setItem('david_categories', JSON.stringify(updatedCats));
        if (formCategory === catToDelete && updatedCats.length > 0) {
          setFormCategory(updatedCats[0]);
        }

        // 2. Identify corresponding Category document on Firestore and delete
        if (auth.currentUser) {
          try {
            const catsSnapshot = await getDocs(collection(db, 'categories')).catch((err) => {
              handleFirestoreError(err, OperationType.GET, 'categories');
            });
            if (catsSnapshot) {
              const catDoc = catsSnapshot.docs.find(doc => doc.data().name === catToDelete);
              if (catDoc) {
                await deleteDoc(doc(db, 'categories', catDoc.id)).catch((err) => {
                  handleFirestoreError(err, OperationType.DELETE, `categories/${catDoc.id}`);
                });
                console.log("Deleted category from Firestore successfully.");
              }
            }
          } catch (err: any) {
            console.error("Firestore Category delete error:", err);
            showCustomAlert('刪除分類失敗', `錯誤: ${err.message || err}`, 'error');
          }
        } else {
          console.log("Deleted category locally.");
        }
      },
      'warning'
    );
  };

  // Filters & Search
  const filteredBlogs = blogs.filter(b => {
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fcfaf7] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 z-50 animate-pulse" />
      {/* Search & Header Section */}
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-brand-600 font-bold transition-colors mb-8 cursor-pointer group"
          id="blog-back-btn"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回首頁
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-zinc-200/60 pb-8">
          <div>
            <span className="text-[10px] md:text-xs font-black tracking-widest text-[#8e7a64] uppercase bg-brand-50 border border-brand-200 px-3 py-1 rounded-md">
              大衛哥AI假髮專欄
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mt-3 tracking-tight liquid-glass-heading inline-block animate-none">
              大衛假髮品牌部落格
            </h1>
            <p className="text-zinc-500 font-light text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              最真實的口碑案例分享、最頂級的手鉤工藝剖析、最客觀的落髮與醫療假髮照護知識，給您滿滿的「頂上安全感」。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                } else {
                  showCustomAlert('提示', '若要管理後台，請先登入！', 'warning');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide cursor-pointer border ${
                isAdminMode 
                  ? 'bg-zinc-900 text-white border-zinc-950' 
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
              id="admin-toggle-btn"
            >
              <Settings className="w-4 h-4 animate-none" />
              {isAdminMode ? '退出管理台' : '進入管理後台'}
            </button>

            {isAdminMode && (
              <button
                onClick={() => {
                  setEditingPost(null);
                  setFormTitle('');
                  setFormContent('');
                  setFormExcerpt('');
                  setFormImgUrl('');
                  setFormReadTime('3 min');
                  setFormTab('edit');
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2.5 rounded-xl font-black text-xs transition-all tracking-wide cursor-pointer border border-amber-500 shadow-md shadow-brand-500/10"
                id="add-new-btn"
              >
                <Plus className="w-4 h-4" />
                自行新增文章
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar & Search Input */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-10 w-full">
          {/* Categories Tab Scroll */}
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#a8927a] text-zinc-950 shadow-md shadow-brand-500/10'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              全部文章 ({blogs.length})
            </button>
            {categories.map((cat) => {
              const count = blogs.filter(b => b.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#a8927a] text-zinc-950 shadow-md shadow-brand-500/10'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
            
            {onNavigateToCases && (
              <button
                onClick={onNavigateToCases}
                className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer bg-white border border-dashed border-brand-400 text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                案例分享實績
              </button>
            )}

            {isAdminMode && (
              <button
                onClick={() => setIsCategoryManageOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-extrabold border border-dashed border-amber-500 text-[#8e7a64] hover:bg-amber-50 transition-colors whitespace-nowrap cursor-pointer"
                id="manage-cats-btn"
              >
                管理閱讀分類
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="搜尋文章標題或內容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8927a] transition-all font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-full hover:bg-zinc-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
            <p className="text-zinc-500 text-xs font-light">連線至 .db 資料庫中...</p>
          </div>
        ) : (
          /* Main Grid: Articles (Left) + Admin Drawer/Modal & Article Viewer (Conditional) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl overflow-hidden border border-zinc-200/70 hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                  id={`blog-card-${post.id}`}
                >
                  {/* Admin Quick Badges */}
                  {isAdminMode && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="p-2 bg-zinc-900 text-white hover:bg-[#a8927a] rounded-xl transition-all shadow cursor-pointer border border-zinc-800"
                        title="編輯文章"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow cursor-pointer border border-red-700"
                        title="刪除文章"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Featured Image or Text Banner */}
                  {post.imgUrl && post.imgUrl.trim() !== '' ? (
                    <div 
                      onClick={() => setSelectedPost(post)}
                      className="aspect-video w-full overflow-hidden relative cursor-pointer group"
                    >
                      <img loading="lazy" decoding="async"
                        src={post.imgUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          點擊閱讀全文 <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                      
                      {/* Category Tag */}
                      <span className="absolute bottom-4 left-4 z-10 text-[10px] uppercase tracking-wider font-extrabold bg-[#a8927a] text-zinc-950 px-2.5 py-1 rounded-lg shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedPost(post)}
                      className="h-28 bg-gradient-to-br from-stone-100 via-[#f7f4ee] to-stone-200 border-b border-stone-200/80 p-5 flex flex-col justify-between relative cursor-pointer group overflow-hidden"
                    >
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#a8927a] text-zinc-950 px-2.5 py-1 rounded-lg shadow-sm">
                          {post.category}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ImageOff className="w-3 h-3 text-stone-400" />
                          純文字文庫
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 font-medium flex items-center gap-1 group-hover:text-stone-900 transition-colors z-10">
                        <span>點擊閱讀全文專欄</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8e7a64]" />
                        {post.publishDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8e7a64]" />
                        {post.readTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#8e7a64]" />
                        {post.author}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setSelectedPost(post)}
                      className="text-lg font-black text-zinc-900 mb-2 leading-snug hover:text-[#a8927a] transition-colors cursor-pointer line-clamp-2"
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-zinc-500 font-light text-xs leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-xs text-zinc-900 font-black tracking-wider flex items-center gap-1 group hover:text-[#8e7a64] transition-colors cursor-pointer"
                      >
                        閱讀全文
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      {isAdminMode && (
                        <span className="text-[10px] text-[#8e7a64] font-bold border border-[#8e7a64]/30 px-2 py-0.5 rounded-md bg-brand-50">
                          後台可編輯
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white rounded-3xl border border-zinc-200/60 p-8 flex flex-col justify-center items-center">
                <FolderOpen className="w-12 h-12 text-zinc-300 mb-4 animate-pulse" />
                <h3 className="text-zinc-800 font-bold text-base mb-1">目前無任何文章</h3>
                <p className="text-zinc-400 font-light text-xs max-w-sm">
                  {"資料庫暫無文章，請點擊「進入管理後台」>「自行新增文章」來張貼您的第一篇部落格文章吧！"}
                </p>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-zinc-800 transition-all"
                  >
                    返回全部文章
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Article Reader */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/70 z-[200] flex justify-center items-center p-4 backdrop-blur-none sm:backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#fcfaf7] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto overscroll-contain relative border border-zinc-200"
              id="article-reader-modal"
            >
              {/* Cover Banner (Conditional based on whether imgUrl exists) */}
              {selectedPost.imgUrl && selectedPost.imgUrl.trim() !== '' ? (
                <div className="w-full h-64 md:h-80 relative overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={selectedPost.imgUrl}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-6 md:p-8 flex flex-col justify-end">
                    <span className="self-start text-[9px] uppercase tracking-wider font-extrabold bg-[#a8927a] text-zinc-950 px-2.5 py-1 rounded-lg mb-4">
                      {selectedPost.category}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-snug">
                      {selectedPost.title}
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-4 right-4 bg-zinc-950/80 text-white p-2.5 rounded-full transition-all border border-zinc-800/40 cursor-pointer hover:bg-zinc-900"
                    id="close-reader-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-full bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white p-6 md:p-10 relative overflow-hidden border-b border-stone-800">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#a8927a] text-zinc-950 px-2.5 py-1 rounded-lg">
                      {selectedPost.category}
                    </span>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="bg-stone-800/80 text-stone-300 hover:text-white p-2.5 rounded-full transition-all border border-stone-700 cursor-pointer"
                      id="close-reader-btn"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    {selectedPost.title}
                  </h2>
                </div>
              )}

              {/* Reader Meta */}
              <div className="px-6 md:px-10 py-6 border-b border-zinc-200/50 bg-white flex flex-wrap gap-4 md:gap-8 items-center text-xs text-zinc-500 font-bold tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8e7a64]" />
                  <span>作者：{selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8e7a64]" />
                  <span>發布：{selectedPost.publishDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8e7a64]" />
                  <span>閱讀：{selectedPost.readTime}</span>
                </div>
              </div>

              {/* Reader Body (Rich Content Layout) */}
              <div className="px-6 md:px-10 py-8 leading-relaxed text-zinc-800 font-light text-sm md:text-base prose prose-zinc max-w-none text-left">
                <div className="markdown-body">
                  <Markdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      )
                    }}
                  >
                    {selectedPost.content}
                  </Markdown>
                </div>
              </div>

              {/* Reader Footer Options */}
              <div className="bg-white border-t border-zinc-200/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#a8927a]" />
                  <span className="text-xs text-zinc-500 font-medium">看完了？對客製化髮片有興趣嗎？</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-all cursor-pointer"
                  >
                    結束閱讀
                  </button>
                  <a
                    href="https://line.me/R/ti/p/@davidhair"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#06C755] hover:bg-[#05b34c] text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow"
                  >
                    Line 一對一預約諮詢
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Create / Edit Blog Post Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/70 z-[200] flex justify-center items-center p-4 backdrop-blur-none sm:backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-zinc-200"
              id="blog-form-modal"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-[#fcfaf7]">
                <div>
                  <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#a8927a]" />
                    {editingPost ? '編輯品牌文章' : '全新自創品牌文章'}
                  </h2>
                  <p className="text-zinc-500 text-[10px] sm:text-xs font-light mt-1">
                    新增或更新在部落格公開展示的文章。這些文章將被永久儲存在與系統連接的 .db 資料庫中。
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 p-2 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdatePost} className="p-6 space-y-5">
                {/* Categorization & Author Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider mb-1.5">
                      閱讀分類目錄 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#fcfaf7] border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider mb-1.5">
                      撰寫署名
                    </label>
                    <select
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#fcfaf7] border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="大衛哥">大衛哥 (David)</option>
                      <option value="大衛嫂">大衛嫂</option>
                      <option value="核心造型總監">核心造型總監</option>
                      <option value="大衛假髮核心">大衛假髮核心</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider mb-1.5">
                    文章標題 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="請輸入抓人眼球的標題（如：陳先生量模漸變修剪實錄...）"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#a8927a]"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider mb-1.5">
                    文章摘要/引言 (簡短描述)
                  </label>
                  <input
                    type="text"
                    placeholder="簡單概述一兩句話，會呈呈現列表卡片上。留空將由系統自動擷取前100字。"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#a8927a]"
                  />
                </div>

                {/* Cover Photo Option & Settings */}
                <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                      文章封面照設定
                    </label>
                    <span className="text-[11px] text-stone-500 font-medium">
                      選擇封面呈現方式或純文字模式
                    </span>
                  </div>

                  {/* 3 Option Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCoverOption('random')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        coverOption === 'random'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 shrink-0 ${coverOption === 'random' ? 'text-amber-400' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">系統推薦美圖</div>
                        <div className={`text-[10px] ${coverOption === 'random' ? 'text-stone-300' : 'text-stone-400'}`}>
                          自動挑選高質感髮型照
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverOption('url')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        coverOption === 'url'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <ImageIcon className={`w-4 h-4 shrink-0 ${coverOption === 'url' ? 'text-amber-400' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">自訂圖片網址</div>
                        <div className={`text-[10px] ${coverOption === 'url' ? 'text-stone-300' : 'text-stone-400'}`}>
                          自行貼上相片連結
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCoverOption('none');
                        setFormImgUrl('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        coverOption === 'none'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <ImageOff className={`w-4 h-4 shrink-0 ${coverOption === 'none' ? 'text-amber-400' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">不使用封面照</div>
                        <div className={`text-[10px] ${coverOption === 'none' ? 'text-stone-300' : 'text-stone-400'}`}>
                          純文字簡約風專欄
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Contextual Input depending on option */}
                  {coverOption === 'url' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                        請輸入封面圖片完整網址 (URL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... 或任意有效圖檔網址"
                        value={formImgUrl}
                        onChange={(e) => setFormImgUrl(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#a8927a]"
                      />
                    </div>
                  )}

                  {coverOption === 'random' && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900/80 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>發布或儲存時，系統將自動配置經高解析度最佳化的精選髮型美圖。</span>
                    </div>
                  )}

                  {coverOption === 'none' && (
                    <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600 flex items-center gap-2">
                      <ImageOff className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>此文章將不設置任何封面圖，在文章列表與閱讀器中均以沉浸式純文字風格展示。</span>
                    </div>
                  )}
                </div>

                {/* Read time */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider mb-1.5">
                    估計閱讀時間
                  </label>
                  <input
                    type="text"
                    placeholder="例如：4 min"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#a8927a]"
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                      文章大主體內容 <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {"提示：用 ### 代表小標題、 > 代表金句引言、- 代表列表"}
                    </span>
                  </div>

                  <div className="flex border-b border-zinc-200 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormTab('edit')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                        formTab === 'edit'
                          ? 'border-[#a8927a] text-zinc-900 font-extrabold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      撰寫內容 (支援 Markdown)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTab('preview')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                        formTab === 'preview'
                          ? 'border-[#a8927a] text-zinc-900 font-extrabold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      即時效果預覽
                    </button>
                  </div>

                  {formTab === 'edit' ? (
                    <textarea
                      required
                      placeholder="### 用標題帶領讀者...&#10;進到故事的核心內容，一頂好假髮，是需要隨著您的頭圍骨相微調...&#10;> 這是一段引言金句..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full px-3.5 py-3 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#a8927a] font-sans h-64 scrollbar-none"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 bg-[#fcfaf7] h-64 overflow-y-auto prose prose-zinc max-w-none text-left scrollbar-none">
                      {formContent.trim() ? (
                        <div className="markdown-body">
                          <Markdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" />
                              )
                            }}
                          >
                            {formContent}
                          </Markdown>
                        </div>
                      ) : (
                        <p className="text-zinc-400 italic text-xs font-light">
                          您尚未輸入任何內容，請切換回「撰寫內容」分頁開始編輯！
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Panel */}
                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs hover:bg-zinc-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs transition-colors cursor-pointer border border-amber-500 shadow-md shadow-brand-500/10"
                    id="save-post-btn"
                  >
                    {editingPost ? '儲存修改' : '全新發布文章'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Category Management Console */}
      <AnimatePresence>
        {isCategoryManageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/70 z-[200] flex justify-center items-center p-4 backdrop-blur-none sm:backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200"
              id="category-manage-modal"
            >
              <div className="p-5 border-b border-zinc-100 bg-[#fcfaf7] flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-zinc-900 text-base">
                    自主管理分類目錄
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-light">新增自訂分類、或檢視現行文章數量分佈</p>
                </div>
                <button
                  onClick={() => setIsCategoryManageOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 p-2 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Form to Add Category */}
                <form onSubmit={handleAddNewCategory} className="space-y-2">
                  <label className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    新增閱讀分類名稱
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="例如：洗護指南、店內小趣事"
                      value={newCategoryInput}
                      onChange={(e) => {
                        setNewCategoryInput(e.target.value);
                        setCategoryError('');
                      }}
                      className="flex-grow px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-light"
                    />
                    <button
                      type="submit"
                      className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl border border-zinc-950 shrink-0 cursor-pointer"
                    >
                      新增分類
                    </button>
                  </div>
                  {categoryError && (
                    <p className="text-red-500 text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {categoryError}
                    </p>
                  )}
                </form>

                {/* List of current Categories */}
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    現行已有分類 ({categories.length})
                  </span>
                  <div className="border border-zinc-100 rounded-2xl bg-[#fcfaf7] overflow-hidden divide-y divide-zinc-100 animate-none max-h-60 overflow-y-auto">
                    {categories.map((cat) => {
                      const amount = blogs.filter(b => b.category === cat).length;
                      return (
                        <div key={cat} className="p-3 flex items-center justify-between text-xs text-zinc-700 bg-white hover:bg-zinc-50/50">
                          <span className="font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#a8927a]" />
                            {cat}
                            <span className="text-[10px] text-zinc-400 font-medium font-mono">({amount} 篇)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="刪除此分類"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                  <button
                    onClick={() => setIsCategoryManageOpen(false)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-950 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-zinc-800"
                  >
                    完成
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Custom Safe Dialog (for alerts and confirms block alternative) */}
      <AnimatePresence>
        {modalAlert.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/75 z-[200] flex justify-center items-center p-4 backdrop-blur-none sm:backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 p-6 flex flex-col relative"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full shrink-0 ${
                  modalAlert.type === 'error' ? 'bg-red-50 text-red-600' :
                  modalAlert.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  modalAlert.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {modalAlert.type === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : modalAlert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : modalAlert.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 mb-1 leading-snug">
                    {modalAlert.title}
                  </h3>
                  <p className="text-zinc-500 font-light text-xs leading-relaxed whitespace-pre-line">
                    {modalAlert.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-zinc-100">
                {modalAlert.showCancel && (
                  <button
                    onClick={() => setModalAlert(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={() => {
                    setModalAlert(prev => ({ ...prev, isOpen: false }));
                    if (modalAlert.onConfirm) {
                      modalAlert.onConfirm();
                    }
                  }}
                  className={`px-5 py-2 text-white font-black text-xs rounded-xl hover:shadow duration-150 cursor-pointer ${
                    modalAlert.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    modalAlert.type === 'warning' ? 'bg-[#a8927a] text-zinc-950 hover:bg-[#8e7a64]' :
                    modalAlert.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  確定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

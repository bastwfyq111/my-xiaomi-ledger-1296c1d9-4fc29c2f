import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";

// استيراد الأيقونات التوضيحية لكل تبويب في النظام المالي
import {
  WalletCards,
  FileBox,
  FileSpreadsheet,
  BookOpenText,
  PieChart,
  TrendingUp,
  ReceiptText,
  DownloadCloud,
} from "lucide-react";

// استيراد ملفات التبويبات الفرعية المكونة للنظام
import HafizaTab from "@/components/HafizaTab";
import AccountTab from "@/components/AccountTab";
import JournalTab from "@/components/JournalTab";
import InstallmentsTab from "@/components/InstallmentsTab";
import MonthlyStatementTab from "@/components/MonthlyStatementTab";
import RevenueTab from "@/components/RevenueTab";
import ExpensesTab from "@/components/ExpensesTab";
import AppTabs from "@/components/AppTabs";

// استيراد وظائف الـ PWA
import { canInstall, onInstallAvailability, promptInstall } from "@/lib/pwa";

// إعداد مسار التوجيه والبيانات التعريفية للمتصفح
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "قيادة النظام المالي - المجلس اليمني للاختصاصات الطبية" },
      {
        name: "description",
        content:
          "تطبيق إدارة قيود اليومية وحوافظ التوريد للمجلس اليمني للاختصاصات الطبية - يعمل بدون إنترنت",
      },
      { name: "theme-color", content: "#0f766e" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Tajawal:wght@400;500;700&display=swap",
      },
    ],
  }),
});

type Tab =
  | "installments"
  | "hafiza"
  | "account"
  | "journal"
  | "monthly"
  | "revenue"
  | "expenses-table"
  | "general-expenses-ledger";

// تعريف قائمة التبويبات مع بياناتها
const tabs: { value: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    value: "installments",
    label: "كشف الأقساط",
    shortLabel: "أقساط",
    icon: <WalletCards className="w-5 h-5" />,
  },
  {
    value: "hafiza",
    label: "حوافظ التوريد",
    shortLabel: "حوافظ",
    icon: <FileBox className="w-5 h-5" />,
  },
  {
    value: "account",
    label: "الحساب الجاري",
    shortLabel: "حساب",
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
  {
    value: "journal",
    label: "القيود اليومية",
    shortLabel: "قيود",
    icon: <BookOpenText className="w-5 h-5" />,
  },
  {
    value: "monthly",
    label: "كشف شهري",
    shortLabel: "شهري",
    icon: <PieChart className="w-5 h-5" />,
  },
  {
    value: "revenue",
    label: "الإيرادات",
    shortLabel: "إيرادات",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    value: "expenses-table",
    label: "المصروفات",
    shortLabel: "مصروفات",
    icon: <ReceiptText className="w-5 h-5" />,
  },
  {
    value: "general-expenses-ledger",
    label: "سجل النفقات",
    shortLabel: "السجل",
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
];

function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("installments");
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    setPwaInstallable(canInstall());
    const unsubscribe = onInstallAvailability((available) => {
      setPwaInstallable(available);
    });
    if (typeof window !== "undefined") {
      setIsInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true,
      );
    }
    return () => unsubscribe();
  }, []);

  const handlePWAInstall = async () => {
    if (!pwaInstallable) {
      // متصفحات شاومي (MIUI) لا تدعم نافذة التثبيت التلقائية — نعرض الخطوات اليدوية
      setShowGuide(true);
      return;
    }
    const success = await promptInstall();
    if (success) {
      toast.success("يتم الآن تثبيت النظام على جهازك.");
      setPwaInstallable(false);
    } else {
      setShowGuide(true);
    }
  };

  return (
    // الحاوية الرئيسية مع مساحة سفلية لشريط التنقل
    <div
      className="xiaomi-phone-shell app-surface w-full min-h-[100svh] font-tajawal selection:bg-cyan-400/25 text-sm sm:text-base"
      dir="rtl"
    >
      {/* قسم الهيدر العلوي */}
      <div className="safe-pad-top relative overflow-hidden rounded-b-[2rem] border-b border-white/25 bg-[linear-gradient(135deg,#0f3a6d_0%,#126d8f_48%,#15a39d_100%)] p-4 text-white shadow-[0_18px_45px_rgba(8,47,73,0.24)] sm:p-6 lg:mx-4 lg:mt-4 lg:rounded-[2rem]">
        <div className="pointer-events-none absolute -left-12 top-0 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* الجزء الأيمن: الأيقونة، العنوان، والوصف */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden rounded-2xl border border-white/20 bg-white/15 p-3 text-white shadow-inner shadow-white/10 backdrop-blur sm:block">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="w-fit rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold text-cyan-50 backdrop-blur">
                لوحة مالية ذكية
              </span>
              <h1 className="font-cairo text-lg font-black leading-tight tracking-tight sm:text-2xl md:text-3xl">
                المجلس اليمني للاختصاصات الطبية
              </h1>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-50/90 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
                </span>
                نظام الإدارة المالية وحوافظ التوريد - صعدة • 2026م
              </p>
            </div>
          </div>

          {/* الجزء الأيسر: زر التثبيت PWA */}
          <div className="flex flex-wrap items-center gap-2 px-1 sm:px-0">
            {!isInstalled && (
              <button
                onClick={handlePWAInstall}
                className="flex items-center gap-1.5 rounded-2xl border border-amber-200/60 bg-gradient-to-l from-amber-300 to-yellow-100 px-3 py-2 text-[11px] font-black text-slate-900 shadow-[0_10px_24px_rgba(245,158,11,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(245,158,11,0.34)] sm:text-xs"
              >
                <DownloadCloud className="h-4 w-4" />
                <span>تثبيت التطبيق</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* دليل التثبيت اليدوي على أجهزة أندرويد / شاومي */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 safe-pad-x safe-pad-bottom"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-5 text-right shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-cairo text-lg font-black text-[#10528e]">
              تثبيت التطبيق على جهاز شاومي / أندرويد
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pr-5 text-xs leading-6 text-slate-700">
              <li>افتح هذا الرابط داخل متصفح Google Chrome (وليس متصفح شاومي).</li>
              <li>
                اضغط على زر القائمة <span className="font-bold">(⋮)</span> أعلى يمين المتصفح.
              </li>
              <li>
                اختر <span className="font-bold">إضافة إلى الشاشة الرئيسية</span> أو{" "}
                <span className="font-bold">تثبيت التطبيق</span>.
              </li>
              <li>وافق على الإضافة، وسيظهر التطبيق بأيقونته على شاشة الجهاز ويعمل بدون إنترنت.</li>
            </ol>
            <p className="mt-3 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800">
              ملاحظة: التثبيت يعمل على الرابط المنشور فقط (وليس داخل نافذة المعاينة).
            </p>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-2xl bg-gradient-to-l from-[#10528e] to-[#15a39d] py-2.5 text-xs font-black text-white shadow-lg"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* محتوى التبويب النشط */}
      <div className="xiaomi-content mx-auto w-full max-w-[1800px] p-2 sm:p-4 md:p-6">
        <div className="app-content-card">
          {activeTab === "installments" && <InstallmentsTab />}
          {activeTab === "hafiza" && <HafizaTab />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "journal" && <JournalTab />}
          {activeTab === "monthly" && <MonthlyStatementTab />}
          {activeTab === "revenue" && <RevenueTab />}
          {activeTab === "expenses-table" && <ExpensesTab />}
          {activeTab === "general-expenses-ledger" && <AppTabs />}
        </div>
      </div>

      {/* شريط التنقل السفلي الثابت */}
      <nav
        className="xiaomi-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/88 shadow-[0_-18px_45px_rgba(8,47,73,0.28)] backdrop-blur-xl sm:left-1/2 sm:bottom-4 sm:w-[min(920px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-[1.75rem] sm:border sm:border-white/15"
        dir="rtl"
      >
        {/* شريط التمرير الأفقي للتبويبات */}
        <div className="safe-pad-x overflow-x-auto p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    flex min-w-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200
                    ${
                      isActive
                        ? "bg-white text-[#0b3d6d] shadow-lg shadow-cyan-950/25"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`transition-transform duration-200 ${isActive ? "scale-110 text-amber-500" : "scale-100"}`}
                  >
                    {tab.icon}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-black leading-tight">
                    {tab.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* مساحة آمنة للأجهزة ذات الشريط السفلي (iPhone X وما بعده) */}
        <div
          className="h-safe-area-inset-bottom bg-transparent"
          style={{ height: "env(safe-area-inset-bottom)" }}
        />
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}

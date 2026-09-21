import React, { useState, useEffect } from 'react';
import { Presentation, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export default function ExecutiveDeck() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/presentation/slides')
      .then((res) => res.json())
      .then((data) => {
        setSlides(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching presentation slides:', err);
        setLoading(false);
      });
  }, []);

  if (loading || slides.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading Executive Presentation Deck...</div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Presentation Header & Deck Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-diy-orange flex items-center justify-center text-white shadow-md">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Executive Presentation Deck</h2>
            <p className="text-xs text-slate-400">OTIF Diagnostic & Retailer Penalty Reduction Strategy for DIY Leadership</p>
          </div>
        </div>

        {/* Slide navigation controls */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </span>

          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Card Canvas */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-8 shadow-2xl min-h-[480px] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background graphic gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-diy-orange/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div>
          {/* Slide Header */}
          <div className="border-b border-slate-800 pb-4 mb-6">
            <div className="text-xs font-extrabold text-diy-orange uppercase tracking-wider mb-1">
              DIY Supply Chain Steering Committee • Slide {slide.slide_id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{slide.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{slide.subtitle}</p>
          </div>

          {/* Slide Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
            {/* Bullets List */}
            <div className="lg:col-span-2 space-y-4">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-sky-500/20">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>

            {/* Slide Callout Metric Box */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-diy-orange/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-diy-orange/10 border border-diy-orange/30 flex items-center justify-center text-diy-orange mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Key Executive Indicator</span>
              <div className="text-3xl font-black text-amber-400 my-2">{slide.kpi_callout.value}</div>
              <div className="text-xs text-slate-300 font-semibold">{slide.kpi_callout.label}</div>
              <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Benchmark Standard: {slide.kpi_callout.benchmark}
              </span>
            </div>
          </div>
        </div>

        {/* Slide Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500">
          <div>DIY Home Improvement Co. • Confidential Board Presentation</div>
          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === idx ? 'bg-diy-orange w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

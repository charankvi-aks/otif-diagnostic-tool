import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OTIFBridge from './components/OTIFBridge';
import OrderAssignmentEngine from './components/OrderAssignmentEngine';
import CarrierOptimizer from './components/CarrierOptimizer';
import NodeDrilldown from './components/NodeDrilldown';
import SLABottleneck from './components/SLABottleneck';
import OrderBookExplorer from './components/OrderBookExplorer';
import MasterDataManager from './components/MasterDataManager';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState('bridge');
  const [isPinned, setIsPinned] = useState(false);
  const [assignedCarrierFlow, setAssignedCarrierFlow] = useState(null);
  const [filters, setFilters] = useState({
    customerType: 'All',
    category: 'All',
    dateFrom: '2026-06-01',
    dateTo: '2026-08-31',
  });
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleFlowCarrierToProfit = (carrierFlowData) => {
    setAssignedCarrierFlow(carrierFlowData);
    setActiveTab('assignment');
  };

  const fetchSummary = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.customerType !== 'All') params.append('customer_type', filters.customerType);
    if (filters.category !== 'All') params.append('category', filters.category);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);

    fetch(`/api/otif/summary?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setSummaryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching summary data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, [filters]);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out ${
      isPinned ? 'pl-72' : 'pl-16'
    }`}>
      {/* Left Navigation Bar Docked - Expands on Hover or Pins Open */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      {/* Top sticky header with KPI ribbon and global filters */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        summaryData={summaryData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && activeTab === 'bridge' ? (
          <div className="p-12 text-center text-slate-400">Loading Diagnostic Analytics...</div>
        ) : (
          <ErrorBoundary key={activeTab}>
            {activeTab === 'bridge' && <OTIFBridge summaryData={summaryData} />}
            {activeTab === 'assignment' && <OrderAssignmentEngine filters={filters} assignedCarrierFlow={assignedCarrierFlow} />}
            {activeTab === 'carrier_optimizer' && <CarrierOptimizer filters={filters} onFlowToProfit={handleFlowCarrierToProfit} />}
            {activeTab === 'node_drilldown' && <NodeDrilldown filters={filters} />}
            {activeTab === 'sla' && <SLABottleneck summaryData={summaryData} />}
            {activeTab === 'orders' && <OrderBookExplorer filters={filters} />}
            {activeTab === 'masters' && <MasterDataManager />}
          </ErrorBoundary>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        DIY Home Improvement Co. • OTIF Diagnostic Platform v1.3 • Powered by E2E SLA Monitoring Engine
      </footer>
    </div>
  );
}

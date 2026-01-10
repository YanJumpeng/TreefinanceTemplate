'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, MessageSquare, Search, Plus, List, BarChart3, Download, Users, LogOut, Send } from 'lucide-react';

export default function WarehouseSystem() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newItem, setNewItem] = useState({ project: '', name: '', quantity: 0, threshold: 10 });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'viewer', name: '' });

  // 初始化数据加载
  useEffect(() => {
    const loadInitialData = () => {
      const savedItems = localStorage.getItem('warehouse-items');
      const savedRecords = localStorage.getItem('warehouse-records');
      const savedUsers = localStorage.getItem('warehouse-users');

      if (savedItems) setItems(JSON.parse(savedItems));
      else {
        const sampleItems = [
          { id: '1', project: '综艺A', name: '抱枕', quantity: 45, threshold: 20 },
          { id: '2', project: '电影B', name: '帆布袋', quantity: 5, threshold: 15 }
        ];
        setItems(sampleItems);
        localStorage.setItem('warehouse-items', JSON.stringify(sampleItems));
      }

      if (savedRecords) setRecords(JSON.parse(savedRecords));
      
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      else {
        const defaultUsers = [{ id: '1', username: 'admin', password: '123', role: 'admin', name: '管理员' }];
        setUsers(defaultUsers);
        localStorage.setItem('warehouse-users', JSON.stringify(defaultUsers));
      }
    };
    loadInitialData();
  }, []);

  const saveData = (newItems: any[], newRecords: any[]) => {
    localStorage.setItem('warehouse-items', JSON.stringify(newItems));
    localStorage.setItem('warehouse-records', JSON.stringify(newRecords));
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setShowLoginForm(false);
    } else {
      alert('账号或密码错误 (admin/123)');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginForm(true);
  };

  const handleAddItem = () => {
    if (!newItem.project || !newItem.name) return alert('请填全信息');
    const item = { id: Date.now().toString(), ...newItem };
    const updated = [...items, item];
    setItems(updated);
    saveData(updated, records);
    setShowAddForm(false);
  };

  const exportToExcel = () => {
    const csv = "项目,物品,库存\n" + items.map(i => `${i.project},${i.name},${i.quantity}`).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "库存报表.csv";
    a.click();
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setIsProcessing(true);
    
    // 模拟AI逻辑 (实际需接 API)
    setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `收到指令：已帮您记录关于"${msg}"的操作。 (提示：请在代码中配置 Anthropic API Key 以启用真实 AI 解析)` }]);
        setIsProcessing(false);
    }, 1000);
  };

  // 登录界面
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">仓库系统登录</h2>
          <input 
            className="w-full p-3 border rounded-lg mb-4" 
            placeholder="用户名" 
            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
          />
          <input 
            type="password" 
            className="w-full p-3 border rounded-lg mb-6" 
            placeholder="密码" 
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">登录</button>
        </div>
      </div>
    );
  }

  const lowStockItems = items.filter(i => i.quantity <= i.threshold);
  const filteredItems = items.filter(i => i.name.includes(searchTerm) || i.project.includes(searchTerm));

  // 主界面
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">周边仓库管理系统</h1>
            <p className="text-slate-600">智能化管理，再也不会忘记库存</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-slate-800">{currentUser?.name}</div>
              <div className="text-sm text-slate-500">{currentUser?.role}</div>
            </div>
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow"><Download size={18}/>导出</button>
            <button onClick={handleLogout} className="p-2 bg-red-100 text-red-600 rounded-lg"><LogOut size={20}/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2 rounded-full ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white'}`}>库存看板</button>
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-full ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-white'}`}>AI 助手</button>
          <button onClick={() => setActiveTab('records')} className={`px-6 py-2 rounded-full ${activeTab === 'records' ? 'bg-blue-600 text-white' : 'bg-white'}`}>操作记录</button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3">
                <AlertTriangle className="text-red-500" />
                <div>
                  <p className="font-bold text-red-800">库存预警：有 {lowStockItems.length} 件周边库存不足</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  className="w-full pl-10 pr-4 py-2 border rounded-xl" 
                  placeholder="搜索周边..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setShowAddForm(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"><Plus size={20}/>入库新周边</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-slate-500 text-sm">{item.project}</p>
                    </div>
                    <Package className="text-blue-200" size={32} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-400">当前库存</p>
                      <p className={`text-3xl font-black ${item.quantity <= item.threshold ? 'text-red-500' : 'text-slate-800'}`}>{item.quantity}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">阈值: {item.threshold}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
            <div className="p-4 border-b flex items-center gap-2 font-bold text-slate-700">
              <MessageSquare className="text-blue-500" /> AI 智能管家
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && <div className="text-slate-400 text-sm animate-pulse">AI 正在思考并更新数据库...</div>}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input 
                className="flex-1 p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" 
                placeholder="例如：给《明星大侦探》寄了20个抱枕，给张三..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
              />
              <button onClick={handleChat} className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20}/></button>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4">时间</th>
                  <th className="p-4">类型</th>
                  <th className="p-4">物品</th>
                  <th className="p-4">数量</th>
                  <th className="p-4">操作员</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400">暂无操作记录</td></tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id}>
                      <td className="p-4 text-sm">{r.time}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${r.type === 'outbound' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{r.type === 'outbound' ? '出库' : '入库'}</span></td>
                      <td className="p-4 font-medium">{r.itemName}</td>
                      <td className="p-4">{r.quantity}</td>
                      <td className="p-4 text-slate-500">{r.operator}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

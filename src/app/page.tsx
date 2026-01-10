'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, MessageSquare, Search, Plus, List, BarChart3, Download, Users, LogOut, Truck } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // @ts-ignore
      const itemsResult = await window.storage?.get('warehouse-items');
      // @ts-ignore
      const recordsResult = await window.storage?.get('warehouse-records');
      // @ts-ignore
      const usersResult = await window.storage?.get('warehouse-users');
      
      if (itemsResult) {
        setItems(JSON.parse(itemsResult.value));
      } else {
        const sampleItems = [
          { id: '1', project: '综艺节目A', name: '抱枕', quantity: 45, threshold: 20 },
          { id: '2', project: '综艺节目A', name: '帆布袋', quantity: 5, threshold: 15 },
          { id: '3', project: '电影B', name: '联名T恤', quantity: 120, threshold: 30 },
          { id: '4', project: '纪录片C', name: '马克杯', quantity: 8, threshold: 10 },
        ];
        setItems(sampleItems);
        // @ts-ignore
        await window.storage?.set('warehouse-items', JSON.stringify(sampleItems));
      }
      
      if (recordsResult) {
        setRecords(JSON.parse(recordsResult.value));
      }

      if (usersResult) {
        setUsers(JSON.parse(usersResult.value));
      } else {
        const defaultUsers = [
          { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: '管理员' },
          { id: '2', username: 'operator', password: 'op123', role: 'operator', name: '操作员' },
          { id: '3', username: 'viewer', password: 'view123', role: 'viewer', name: '查看员' }
        ];
        setUsers(defaultUsers);
        // @ts-ignore
        await window.storage?.set('warehouse-users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveData = async (newItems: any[], newRecords?: any[]) => {
    try {
      // @ts-ignore
      await window.storage?.set('warehouse-items', JSON.stringify(newItems));
      if (newRecords) {
        // @ts-ignore
        await window.storage?.set('warehouse-records', JSON.stringify(newRecords));
      }
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setShowLoginForm(false);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('用户名或密码错误');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginForm(true);
    setActiveTab('dashboard');
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('请填写完整信息');
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser
    };

    const newUsers = [...users, user];
    setUsers(newUsers);
    // @ts-ignore
    await window.storage?.set('warehouse-users', JSON.stringify(newUsers));
    setNewUser({ username: '', password: '', role: 'viewer', name: '' });
    alert('用户添加成功');
  };

  const exportToExcel = () => {
    let csvContent = "项目,周边名称,当前库存,预警阈值,状态\n";
    items.forEach(item => {
      const status = item.quantity <= item.threshold ? '⚠️预警' : '正常';
      csvContent += `${item.project},${item.name},${item.quantity},${item.threshold},${status}\n`;
    });
    
    csvContent += "\n\n操作记录\n";
    csvContent += "时间,类型,项目,物品,数量,接收人,物流单号\n";
    records.forEach(record => {
      csvContent += `${record.time},${record.type === 'outbound' ? '出库' : '入库'},${record.project},${record.itemName},${record.quantity},${record.recipient || '-'},${record.trackingNumber || '-'}\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `仓库数据_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `你是一个仓库管理助手。当前库存数据如下：
${JSON.stringify(items, null, 2)}

用户说: "${userMessage}"

请分析用户意图并返回JSON格式的操作指令。可能的操作类型：
1. "query" - 查询库存，返回 {action: "query", result: "查询结果描述"}
2. "outbound" - 出库，返回 {action: "outbound", itemId: "物品ID", quantity: 数量, recipient: "接收人", project: "项目名", itemName: "物品名", trackingNumber: "物流单号(如果提到)"}
3. "inbound" - 入库，返回 {action: "inbound", itemId: "物品ID或null", quantity: 数量, project: "项目名", itemName: "物品名"}
4. "unknown" - 无法理解，返回 {action: "unknown", message: "提示信息"}

只返回JSON，不要其他文字。`
            }
          ]
        })
      });

      const data = await response.json();
      const responseText = data.content[0].text;
      
      let instruction;
      try {
        instruction = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
      } catch {
        instruction = { action: 'unknown', message: '抱歉，我没理解您的意思' };
      }

      let aiResponse = '';
      let newItems = [...items];
      let newRecords = [...records];

      if (instruction.action === 'query') {
        aiResponse = instruction.result;
      } else if (instruction.action === 'outbound') {
        if (currentUser?.role === 'viewer') {
          aiResponse = '您没有操作权限，请联系管理员';
        } else {
          const item = newItems.find(i => i.id === instruction.itemId || 
            (i.project === instruction.project && i.name === instruction.itemName));
          
          if (item && item.quantity >= instruction.quantity) {
            item.quantity -= instruction.quantity;
            newRecords.unshift({
              id: Date.now().toString(),
              type: 'outbound',
              project: item.project,
              itemName: item.name,
              quantity: instruction.quantity,
              recipient: instruction.recipient,
              trackingNumber: instruction.trackingNumber || '',
              operator: currentUser.name,
              time: new Date().toLocaleString('zh-CN')
            });
            aiResponse = `已出库 ${instruction.quantity} 个 ${item.name}，寄给${instruction.recipient}。当前剩余：${item.quantity} 个`;
            if (instruction.trackingNumber) {
              aiResponse += `\n物流单号：${instruction.trackingNumber}`;
            }
            setItems(newItems);
            setRecords(newRecords);
            await saveData(newItems, newRecords);
          } else {
            aiResponse = `库存不足或未找到该物品`;
          }
        }
      } else if (instruction.action === 'inbound') {
        if (currentUser?.role === 'viewer') {
          aiResponse = '您没有操作权限，请联系管理员';
        } else {
          let item = newItems.find(i => i.project === instruction.project && i.name === instruction.itemName);
          
          if (item) {
            item.quantity += instruction.quantity;
          } else {
            item = {
              id: Date.now().toString(),
              project: instruction.project,
              name: instruction.itemName,
              quantity: instruction.quantity,
              threshold: 10
            };
            newItems.push(item);
          }
          
          newRecords.unshift({
            id: Date.now().toString(),
            type: 'inbound',
            project: instruction.project,
            itemName: instruction.itemName,
            quantity: instruction.quantity,
            operator: currentUser.name,
            time: new Date().toLocaleString('zh-CN')
          });
          aiResponse = `已入库 ${instruction.quantity} 个 ${instruction.itemName}。当前库存：${item.quantity} 个`;
          setItems(newItems);
          setRecords(newRecords);
          await saveData(newItems, newRecords);
        }
      } else {
        aiResponse = instruction.message || '我没太理解您的意思，可以说得更具体些吗？';
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '处理出错了，请重试' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddItem = async () => {
    if (currentUser?.role === 'viewer') {
      alert('您没有操作权限');
      return;
    }

    if (!newItem.project || !newItem.name || newItem.quantity < 0) {
      alert('请填写完整信息');
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...newItem
    };

    const newItems = [...items, item];
    setItems(newItems);
    await saveData(newItems, records);
    setNewItem({ project: '', name: '', quantity: 0, threshold: 10 });
    setShowAddForm(false);
  };

  const lowStockItems = items.filter(item => item.quantity <= item.threshold);
  const filteredItems = items.filter(item => 
    item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">周边仓库管理系统</h1>
            <p className="text-slate-600">请登录以继续</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="输入密码"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg transition-all"
            >
              登录
            </button>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm">
            <div className="font-semibold text-slate-700 mb-2">测试账号：</div>
            <div className="space-y-1 text-slate-600">
              <div>管理员: admin / admin123</div>
              <div>操作员: operator / op123</div>
              <div>查看员: viewer / view123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canOperate = currentUser?.role === 'admin' || currentUser?.role === 'operator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">周边仓库管理系统</h1>
            <p className="text-slate-600">智能化管理，再也不会忘记库存</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-slate-800">{currentUser.name}</div>
              <div className="text-sm text-slate-500">
                {currentUser.role === 'admin' ? '管理员' : currentUser.role === 'operator' ? '操作员' : '查看员'}
              </div>
            </div>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowUserManagement(!showUserManagement)}
                className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md"
              >
                <Users size={20} />
              </button>
            )}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"
            >
              <Download size={20} />
              导出数据
            </button>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {showUserManagement && currentUser.role === 'admin' && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={24} />
              用户管理
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-3">添加新用户</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="用户名"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="姓名"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="viewer">查看员</option>
                    <option value="operator">操作员</option>
                    <option value="admin">管理员</option>
                  </select>
                  <button
                    onClick={handleAddUser}
                    className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    添加用户
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">现有用户列表</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map(user => (
                    <div key={user.id} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-slate-600">@{user.username}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? '管理员' : user.role === 'operator' ? '操作员' : '查看员'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">权限说明：</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• 管理员：所有权限（增删改查 + 用户管理）</div>
                <div>• 操作员：可以出入库、添加物品、查看数据</div>
                <div>• 查看员：只能查看库存和记录，无法操作</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow">
          {[
            { id: 'dashboard', icon: BarChart3, label: '库存看板' },
            { id: 'chat', icon: MessageSquare, label: 'AI助手' },
            { id: 'records', icon: List, label: '操作记录' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <h3 className="font-bold text-red-800">库存预警</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded border border-red-200">
                      <div className="font-semibold text-slate-800">{item.project} - {item.name}</div>
                      <div className="text-red-600 font-bold">仅剩 {item.quantity} 个</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索项目或周边名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              {canOperate && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-md transition-all"
                >
                  <Plus size={20} />
                  新增周边
                </button>
              )}
            </div>

            {showAddForm && canOperate && (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                <h3 className="font-bold text-lg mb-4">添加新周边</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="项目名称"
                    value={newItem.project}
                    onChange={(e) => setNewItem({...newItem, project: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="周边名称"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="初始数量"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="预警阈值"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({...newItem, threshold: parseInt(e.target.value) || 10})}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddItem}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    确认添加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="text-blue-500" size={24} />
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-sm text-slate-500">{item.project}</div>
                      </div>
                    </div>
                    {item.quantity <= item.threshold && (
                      <TrendingDown className="text-red-500" size={20} />
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">库存</span>
                      <span className={`font-bold ${item.quantity <= item.threshold ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity} 个
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.quantity <= item.threshold ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((item.quantity / (item.threshold * 2)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    预警线: {item.threshold} 个
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2">AI 智能助手</h2>
              <p className="text-slate-600 text-sm">
                用自然语言管理库存，例如："今天给综艺节目A寄了30个抱枕给张三，单号SF1234

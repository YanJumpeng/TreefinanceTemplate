'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, MessageSquare, Search, Plus, List, BarChart3, Download, Users, LogOut, Truck, FolderTree, Edit2, Trash2 } from 'lucide-react';

export default function WarehouseSystem() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newItem, setNewItem] = useState({ categoryId: '', name: '', quantity: 0, threshold: 10 });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'viewer', name: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const itemsData = localStorage.getItem('dashu-items');
      const categoriesData = localStorage.getItem('dashu-categories');
      const recordsData = localStorage.getItem('dashu-records');
      const usersData = localStorage.getItem('dashu-users');
      
      if (categoriesData) {
        setCategories(JSON.parse(categoriesData));
      } else {
        const defaultCategories = [
          { id: '1', name: '大树财经周边套装', description: '包含衣服、水杯、洗漱包' },
          { id: '2', name: '德州扑克系列', description: '筹码及箱子、桌布' },
          { id: '3', name: 'OracleX项目方周边', description: 'OracleX项目方定制周边套装' }
        ];
        setCategories(defaultCategories);
        localStorage.setItem('dashu-categories', JSON.stringify(defaultCategories));
      }

      if (itemsData) {
        setItems(JSON.parse(itemsData));
      } else {
        const sampleItems = [
          { id: '1', categoryId: '1', name: '大树财经T恤', quantity: 50, threshold: 20 },
          { id: '2', categoryId: '1', name: '大树财经水杯', quantity: 30, threshold: 15 },
          { id: '3', categoryId: '1', name: '大树财经洗漱包', quantity: 25, threshold: 10 },
          { id: '4', categoryId: '2', name: '德州扑克筹码套装', quantity: 15, threshold: 5 },
          { id: '5', categoryId: '2', name: '德州扑克桌布', quantity: 8, threshold: 3 },
          { id: '6', categoryId: '3', name: 'OracleX周边套装', quantity: 20, threshold: 8 },
        ];
        setItems(sampleItems);
        localStorage.setItem('dashu-items', JSON.stringify(sampleItems));
      }
      
      if (recordsData) {
        setRecords(JSON.parse(recordsData));
      }

      if (usersData) {
        setUsers(JSON.parse(usersData));
      } else {
        const defaultUsers = [
          { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: '管理员' },
          { id: '2', username: 'operator', password: 'op123', role: 'operator', name: '操作员' },
          { id: '3', username: 'viewer', password: 'view123', role: 'viewer', name: '查看员' }
        ];
        setUsers(defaultUsers);
        localStorage.setItem('dashu-users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveData = (newItems?: any[], newRecords?: any[], newCategories?: any[]) => {
    try {
      if (newItems) {
        localStorage.setItem('dashu-items', JSON.stringify(newItems));
      }
      if (newRecords) {
        localStorage.setItem('dashu-records', JSON.stringify(newRecords));
      }
      if (newCategories) {
        localStorage.setItem('dashu-categories', JSON.stringify(newCategories));
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

  const handleAddUser = () => {
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
    localStorage.setItem('dashu-users', JSON.stringify(newUsers));
    setNewUser({ username: '', password: '', role: 'viewer', name: '' });
    alert('用户添加成功');
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert('请填写类目名称');
      return;
    }

    const category = {
      id: Date.now().toString(),
      ...newCategory
    };

    const newCategories = [...categories, category];
    setCategories(newCategories);
    saveData(undefined, undefined, newCategories);
    setNewCategory({ name: '', description: '' });
    alert('类目添加成功');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory?.name) {
      alert('请填写类目名称');
      return;
    }

    const newCategories = categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    );
    setCategories(newCategories);
    saveData(undefined, undefined, newCategories);
    setEditingCategory(null);
    alert('类目更新成功');
  };

  const handleDeleteCategory = (categoryId: string) => {
    const hasItems = items.some(item => item.categoryId === categoryId);
    if (hasItems) {
      alert('该类目下还有周边物品，无法删除！请先删除或转移该类目下的所有物品。');
      return;
    }

    if (!confirm('确定要删除这个类目吗？')) return;

    const newCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(newCategories);
    saveData(undefined, undefined, newCategories);
    alert('类目删除成功');
  };

  const exportToExcel = () => {
    let csvContent = "类目,周边名称,当前库存,预警阈值,状态\n";
    items.forEach(item => {
      const category = categories.find(c => c.id === item.categoryId);
      const status = item.quantity <= item.threshold ? '⚠️预警' : '正常';
      csvContent += `${category?.name || '未分类'},${item.name},${item.quantity},${item.threshold},${status}\n`;
    });
    
    csvContent += "\n\n操作记录\n";
    csvContent += "时间,类型,类目,物品,数量,接收人,物流单号,操作人\n";
    records.forEach(record => {
      csvContent += `${record.time},${record.type === 'outbound' ? '出库' : '入库'},${record.categoryName || '-'},${record.itemName},${record.quantity},${record.recipient || '-'},${record.trackingNumber || '-'},${record.operator || '-'}\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `大树财经周边数据_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const itemsWithCategory = items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        return {
          ...item,
          categoryName: category?.name || '未分类'
        };
      });

      // 调用我们自己的后端 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: userMessage,
          items: itemsWithCategory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 调用失败');
      }

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
          const item = newItems.find(i => i.id === instruction.itemId || i.name === instruction.itemName);
          
          if (item && item.quantity >= instruction.quantity) {
            const category = categories.find(c => c.id === item.categoryId);
            item.quantity -= instruction.quantity;
            newRecords.unshift({
              id: Date.now().toString(),
              type: 'outbound',
              categoryName: category?.name || '未分类',
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
            saveData(newItems, newRecords);
          } else {
            aiResponse = `库存不足或未找到该物品`;
          }
        }
      } else if (instruction.action === 'inbound') {
        if (currentUser?.role === 'viewer') {
          aiResponse = '您没有操作权限，请联系管理员';
        } else {
          let item = newItems.find(i => i.id === instruction.itemId || i.name === instruction.itemName);
          
          if (item) {
            const category = categories.find(c => c.id === item.categoryId);
            item.quantity += instruction.quantity;
            newRecords.unshift({
              id: Date.now().toString(),
              type: 'inbound',
              categoryName: category?.name || '未分类',
              itemName: instruction.itemName,
              quantity: instruction.quantity,
              operator: currentUser.name,
              time: new Date().toLocaleString('zh-CN')
            });
            aiResponse = `已入库 ${instruction.quantity} 个 ${instruction.itemName}。当前库存：${item.quantity} 个`;
            setItems(newItems);
            setRecords(newRecords);
            saveData(newItems, newRecords);
          } else {
            aiResponse = '未找到该物品，请先在库存管理中添加';
          }
        }
      } else {
        aiResponse = instruction.message || '我没太理解您的意思，可以说得更具体些吗？';
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error: any) {
      console.error('AI 调用错误:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `处理出错了：${error.message || '请重试'}` 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddItem = () => {
    if (currentUser?.role === 'viewer') {
      alert('您没有操作权限');
      return;
    }

    if (!newItem.categoryId || !newItem.name || newItem.quantity < 0) {
      alert('请填写完整信息');
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...newItem
    };

    const newItems = [...items, item];
    setItems(newItems);
    saveData(newItems);
    setNewItem({ categoryId: '', name: '', quantity: 0, threshold: 10 });
    setShowAddForm(false);
  };

  const lowStockItems = items.filter(item => item.quantity <= item.threshold);
  const filteredItems = items.filter(item => {
    const category = categories.find(c => c.id === item.categoryId);
    return (category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">大树财经周边管理系统</h1>
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="输入密码"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg transition-all"
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
            <h1 className="text-4xl font-bold text-green-700 mb-2">大树财经周边管理系统</h1>
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
              <>
                <button
                  onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                  className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
                  title="类目管理"
                >
                  <FolderTree size={20} />
                </button>
                <button
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md"
                  title="用户管理"
                >
                  <Users size={20} />
                </button>
              </>
            )}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
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

        {showCategoryManagement && currentUser.role === 'admin' && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg border-2 border-orange-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FolderTree size={24} />
              周边类目管理
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-3">添加新类目</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="类目名称"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="类目描述（选填）"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    添加类目
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">现有类目列表</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="p-3 bg-slate-50 rounded-lg border">
                      {editingCategory?.id === category.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="w-full px-3 py-1 border rounded text-sm"
                          />
                          <input
                            type="text"
                            value={editingCategory.description}
                            onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                            className="w-full px-3 py-1 border rounded text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateCategory}
                              className="flex-1 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="flex-1 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-slate-600">{category.description}</div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              包含 {items.filter(item => item.categoryId === category.id).length} 个周边
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="编辑"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="font-semibold text-orange-800 mb-2">类目管理说明：</div>
              <div className="text-sm text-orange-700 space-y-1">
                <div>• 类目用于组织和分类周边产品</div>
                <div>• 删除类目前，需要先删除或转移该类目下的所有周边</div>
                <div>• 类目描述可以帮助团队了解该类目包含的产品</div>
              </div>
            </div>
          </div>
        )}

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
                <div>• 管理员：所有权限（增删改查 + 用户管理 + 类目管理）</div>
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
                  ? 'bg-green-600 text-white shadow-md' 
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
            {/* 统计概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm opacity-90">总库存</div>
                  <Package size={24} className="opacity-75" />
                </div>
                <div className="text-3xl font-bold">{items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                <div className="text-xs opacity-75 mt-1">件周边产品</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm opacity-90">周边种类</div>
                  <List size={24} className="opacity-75" />
                </div>
                <div className="text-3xl font-bold">{items.length}</div>
                <div className="text-xs opacity-75 mt-1">种产品</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm opacity-90">类目数量</div>
                  <FolderTree size={24} className="opacity-75" />
                </div>
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-xs opacity-75 mt-1">个类目</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm opacity-90">库存预警</div>
                  <AlertTriangle size={24} className="opacity-75" />
                </div>
                <div className="text-3xl font-bold">{lowStockItems.length}</div>
                <div className="text-xs opacity-75 mt-1">件需要补货</div>
              </div>
            </div>

            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <h3 className="font-bold text-red-800">库存预警</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lowStockItems.map(item => {
                    const category = categories.find(c => c.id === item.categoryId);
                    return (
                      <div key={item.id} className="bg-white p-3 rounded border border-red-200">
                        <div className="font-semibold text-slate-800">{category?.name} - {item.name}</div>
                        <div className="text-red-600 font-bold">仅剩 {item.quantity} 个</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索类目或周边名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
              {canOperate && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md transition-all"
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
                  <select
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="">选择类目</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

            {/* 按类目分组展示 */}
            {categories.map(category => {
              const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
              if (categoryItems.length === 0) return null;

              const categoryTotal = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
              const categoryLowStock = categoryItems.filter(item => item.quantity <= item.threshold).length;

              // 根据类目设置不同的颜色主题
              const getCategoryColor = (categoryName: string) => {
                if (categoryName.includes('大树财经')) return 'green';
                if (categoryName.includes('德州扑克')) return 'purple';
                if (categoryName.includes('OracleX')) return 'blue';
                return 'slate';
              };

              const color = getCategoryColor(category.name);
              const colorClasses = {
                green: 'bg-green-50 border-green-200',
                purple: 'bg-purple-50 border-purple-200',
                blue: 'bg-blue-50 border-blue-200',
                slate: 'bg-slate-50 border-slate-200'
              };

              const badgeColors = {
                green: 'bg-green-100 text-green-800',
                purple: 'bg-purple-100 text-purple-800',
                blue: 'bg-blue-100 text-blue-800',
                slate: 'bg-slate-100 text-slate-800'
              };

              const iconColors = {
                green: 'text-green-600',
                purple: 'text-purple-600',
                blue: 'text-blue-600',
                slate: 'text-slate-600'
              };

              return (
                <div key={category.id} className="space-y-4">
                  {/* 类目标题卡片 */}
                  <div className={`${colorClasses[color]} border-2 rounded-xl p-4 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${badgeColors[color]} rounded-lg flex items-center justify-center`}>
                          <FolderTree className={iconColors[color]} size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-slate-600">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">{categoryTotal}</div>
                          <div className="text-xs text-slate-600">总库存</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">{categoryItems.length}</div>
                          <div className="text-xs text-slate-600">种类</div>
                        </div>
                        {categoryLowStock > 0 && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">{categoryLowStock}</div>
                            <div className="text-xs text-red-600">预警</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 该类目下的周边产品卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(item => (
                      <div key={item.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-slate-200 hover:border-slate-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-12 h-12 ${badgeColors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Package className={iconColors[color]} size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 truncate">{item.name}</div>
                              <div className={`text-xs ${badgeColors[color]} px-2 py-1 rounded-full inline-block mt-1`}>
                                {category.name}
                              </div>
                            </div>
                          </div>
                          {item.quantity <= item.threshold && (
                            <div className="flex-shrink-0">
                              <TrendingDown className="text-red-500" size={20} />
                            </div>
                          )}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600 font-medium">当前库存</span>
                            <span className={`font-bold text-lg ${item.quantity <= item.threshold ? 'text-red-600' : 'text-green-600'}`}>
                              {item.quantity} 个
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                item.quantity <= item.threshold ? 'bg-red-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min((item.quantity / (item.threshold * 2)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">预警线: {item.threshold} 个</span>
                          {item.quantity <= item.threshold && (
                            <span className="text-red-600 font-semibold">⚠️ 需要补货</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">没有找到相关周边</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2">AI 智能助手</h2>
              <p className="text-slate-600 text-sm">
                用自然语言管理库存，例如："今天给客户寄了30个大树财经T恤，收件人张三，单号SF1234567890"
                {!canOperate && <span className="text-orange-600 font-semibold ml-2">（您当前只有查询权限）</span>}
              </p>
            </div>
            
            <div className="h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-slate-50 rounded-lg">
              {chatHistory.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                  <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>开始对话吧！试试说"查看所有库存"或"德州扑克还有多少"</p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="输入你的指令..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                disabled={isProcessing}
              />
              <button
                onClick={handleChat}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md"
              >
                发送
              </button>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">操作记录</h2>
            <div className="space-y-2">
              {records.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  <List size={48} className="mx-auto mb-2 opacity-50" />
                  <p>暂无操作记录</p>
                </div>
              )}
              {records.map(record => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      record.type === 'outbound' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <TrendingDown className={record.type === 'outbound' ? 'text-red-600' : 'text-green-600 rotate-180'} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        {record.type === 'outbound' ? '出库' : '入库'}: {record.itemName}
                      </div>
                      <div className="text-sm text-slate-600">
                        {record.categoryName} · 数量: {record.quantity}
                        {record.recipient && ` · 接收人: ${record.recipient}`}
                        {record.operator && ` · 操作人: ${record.operator}`}
                      </div>
                      {record.trackingNumber && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-blue-600">
                          <Truck size={14} />
                          <span>物流单号: {record.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 ml-4">
                    {record.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

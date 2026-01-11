// 在项目中创建: app/api/chat/route.ts
// 这是一个服务器端 API，API Key 不会暴露给前端

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 从服务器环境变量读取 API Key（注意：不使用 NEXT_PUBLIC_ 前缀）
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器未配置 API Key' },
        { status: 500 }
      );
    }

    // 获取前端发送的请求体
    const body = await request.json();
    const { messages, items } = body;

    // 调用 Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `你是大树财经周边仓库管理助手。当前库存数据如下：
${JSON.stringify(items, null, 2)}

用户说: "${messages}"

请分析用户意图并返回JSON格式的操作指令。可能的操作类型：
1. "query" - 查询库存，返回 {action: "query", result: "查询结果描述"}
2. "outbound" - 出库，返回 {action: "outbound", itemId: "物品ID", quantity: 数量, recipient: "接收人", itemName: "物品名", trackingNumber: "物流单号(如果提到)"}
3. "inbound" - 入库，返回 {action: "inbound", itemId: "物品ID或null", quantity: 数量, itemName: "物品名"}
4. "unknown" - 无法理解，返回 {action: "unknown", message: "提示信息"}

只返回JSON，不要其他文字。`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Anthropic API 调用失败', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Route 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', message: error.message },
      { status: 500 }
    );
  }
}

// 可选：添加 CORS 支持
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

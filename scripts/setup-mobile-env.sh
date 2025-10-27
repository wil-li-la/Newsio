#!/bin/bash

# 自動設定 Mobile App 的 API URL 環境變數

echo "🔧 設定 Mobile App 環境變數..."

# 偵測本機 IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
    if [ -z "$LOCAL_IP" ]; then
        # 如果 en0 沒有 IP，嘗試 en1 (可能是 Wi-Fi)
        LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    echo "❌ 不支援的作業系統: $OSTYPE"
    exit 1
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ 無法偵測本機 IP 位址"
    echo "請手動執行以下命令查看 IP："
    echo "  Mac: ipconfig getifaddr en0"
    echo "  Linux: hostname -I"
    exit 1
fi

echo "✅ 偵測到本機 IP: $LOCAL_IP"

# 檢查 .env 是否存在
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 .env 不存在，從 .env.example 複製..."
    cp .env.example .env
fi

# 更新或新增 EXPO_PUBLIC_API_URL
API_URL="http://${LOCAL_IP}:3000"

if grep -q "^EXPO_PUBLIC_API_URL=" "$ENV_FILE"; then
    # 更新現有的值
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=${API_URL}|" "$ENV_FILE"
    else
        sed -i "s|^EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=${API_URL}|" "$ENV_FILE"
    fi
    echo "✅ 已更新 EXPO_PUBLIC_API_URL=${API_URL}"
else
    # 新增
    echo "" >> "$ENV_FILE"
    echo "EXPO_PUBLIC_API_URL=${API_URL}" >> "$ENV_FILE"
    echo "✅ 已新增 EXPO_PUBLIC_API_URL=${API_URL}"
fi

echo ""
echo "🎉 設定完成！"
echo ""
echo "📱 下一步："
echo "  1. 啟動 Docker 服務: docker-compose up"
echo "  2. 啟動 Mobile App: cd apps/mobile && npm start"
echo ""
echo "💡 提示："
echo "  - 如果切換網路，請重新執行此腳本"
echo "  - 或手動編輯 .env 中的 EXPO_PUBLIC_API_URL"

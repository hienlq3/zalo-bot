# Sử dụng Node chính thức
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json & package-lock.json (nếu có)
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Sao chép toàn bộ source code
COPY . .

# Tạo file convMap.json nếu chưa có (tránh lỗi khi mount)
RUN touch convMap.json

# Mở cổng
EXPOSE 4000

# Lệnh khởi động
CMD ["node", "server.js"]
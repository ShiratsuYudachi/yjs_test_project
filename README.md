## 整体概述
使用Y.js通过websocket处理状态同步，React写的前端，GraphQL定义API，Prisma操作数据库

端口：3001 (后端HTTP)、1234 (WebSocket)、5173 (前端) 

## 项目结构
```
yjs_test_project/
├── packages/
│   ├── backend/                   # 后端应用
│   │   ├── src/                   
│   │   │   ├── graphql/           
│   │   │   ├── store/             # 表格内容存储
│   │   │   └── yjs/               # Y.js 集成
│   │   └── prisma/                # 数据库相关
|   |
│   └── frontend/                   # 前端应用
│       └── src/                   
│           ├── components/        # 这三个都是React相关
│           ├── contexts/          
│           ├── hooks/             
│           ├── service/           # API 服务
│           └── graphql/           # GraphQL 相关
```

## 数据库设计

```prisma
// Prisma Schema
// 表格主表
model Table {
  id         String   @id @default(cuid())  // 唯一标识符
  name       String                         // 表格名称
  password   String?                        // 可选密码保护
  createdAt  DateTime @default(now())       // 创建时间
  cells      TableCell[]                    // 关联的单元格
}

// 表格单元格
model TableCell {
  id        String  @id @default(cuid())    // 唯一标识符
  table     Table   @relation(fields: [tableId], references: [id], onDelete: Cascade)
  tableId   String                          // 关联表格ID
  rowIndex  Int                             // 行索引
  colIndex  Int                             // 列索引
  value     String                          // 单元格内容
  updatedAt DateTime @updatedAt             // 自动更新时间

  @@unique([tableId, rowIndex, colIndex])   // 确保每个位置唯一
}
```

## API 设计

```graphql
// GraphQL Schema
type Table {
  id: ID!                    
  name: String!              
  hasPassword: Boolean!      // 是否有密码保护
  createdAt: String!         
  cells: [TableCell!]!       // 关联的单元格
}

type TableCell {
  id: ID!                    
  rowIndex: Int!             // 行索引
  colIndex: Int!             // 列索引
  value: String!             // 单元格内容
  updatedAt: String!         
}

type Query {
  tables: [Table!]!                          // 获取所有表格
  table(id: ID!): Table                      // 获取指定id的表格
  cells(tableId: ID!): [TableCell!]!         // 获取表格的所有单元格
}

type Mutation {
  createTable(name: String!, rows: Int, cols: Int, password: String): Table!  // 创建表格
  deleteTable(id: ID!): Boolean!                                              // 删除表格
  updateTablePassword(id: ID!, password: String): Boolean!                    // 更新表格密码
  upsertCell(tableId: ID!, rowIndex: Int!, colIndex: Int!, value: String!): Boolean!  // 更新单元格
}
```

### WebSocket API
```
// Y.js 实时协作连接
ws://localhost:1234/{tableId}?password={password}

// 错误码
1000: 表格不存在
1008: 密码错误 
```

## 本地运行环境搭建

### 前置要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 1. 克隆项目
```bash
git clone <repository-url>
cd yjs_test_project
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd packages/backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 返回根目录
cd ../..
```

### 3. 设置数据库

#### 创建环境变量文件
```bash
# 在 packages/backend 目录下创建 .env 文件
cd packages/backend
echo "DATABASE_URL=\"file:./dev.db\"" > .env
```

#### 运行数据库迁移
```bash
# 在 packages/backend 目录下
npx prisma migrate dev
npx prisma generate
```

### 4. 启动开发服务器

#### 启动后端服务
```bash
# 在 packages/backend 目录下
npm run dev

# 服务将在以下端口启动：
# - HTTP/GraphQL: http://localhost:3001
# - WebSocket: ws://localhost:1234
```

#### 启动前端服务
```bash
# 在 packages/frontend 目录下
npm run dev

# 前端将在以下地址启动：
# - http://localhost:5173
```

### 5. 访问应用

打开浏览器访问 http://localhost:5173

1. 首次访问会要求输入昵称
2. 创建新表格或选择现有表格
3. 如果表格有密码保护，会要求输入密码
4. 开始协作编辑！


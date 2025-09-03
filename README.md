# JSON Schema Form

一个基于React、TypeScript和Vite构建的JSON Schema表单生成器。该项目能够根据JSON Schema定义自动生成对应的表单界面，支持多种数据类型和验证规则。

## 功能特性

- 自动根据JSON Schema生成表单界面
- 支持多种数据类型（字符串、数字、布尔值、数组、对象等）
- 内置数据验证
- 响应式设计
- 易于集成到现有React项目

## 技术栈

- React 18+
- TypeScript
- Vite
- CSS Modules

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用方法

1. 在你的React组件中导入表单组件
2. 定义JSON Schema配置
3. 将Schema传递给表单组件

```tsx
import JsonSchemaForm from './components/JsonSchemaForm';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      description: '请输入您的姓名'
    },
    age: {
      type: 'number',
      title: '年龄',
      minimum: 0
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email'
    }
  },
  required: ['name', 'email']
};

function App() {
  const [formData, setFormData] = useState({});

  const handleSubmit = (data) => {
    console.log('表单数据:', data);
  };

  return (
    <div className="app">
      <h1>JSON Schema表单</h1>
      <JsonSchemaForm 
        schema={schema} 
        initialData={formData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

## 项目结构

```
src/
├── App.tsx          # 应用入口组件
├── App.css          # 应用样式
├── components/      # 自定义组件
├── utils/           # 工具函数
└── types/           # TypeScript类型定义
```

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目。

### 提交代码流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## License

本项目采用MIT许可证 - 详情请查看LICENSE文件

## 致谢

- Vite团队提供的优秀构建工具
- React社区的支持和贡献

---

如果你觉得这个项目有帮助，请给它一个⭐️！

import React, { useState } from 'react'
import './App.css'

// 定义字段类型接口
export interface Field {
  id: string
  name: string
  type: string
  description?: string
  required?: boolean
  items?: Field[] // 用于array类型的items
  properties?: Field[] // 用于object类型的properties
}

// 生成唯一ID的函数
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// 字段组件
const FieldComponent: React.FC<{
  field: Field
  onUpdate: (id: string, updates: Partial<Field>) => void
  onAddSubField: (parentId: string, fieldType: 'items' | 'properties') => void
  onDelete: (id: string) => void
  level?: number
}> = ({ field, onUpdate, onAddSubField, onDelete, level = 0 }) => {
  const isObjectType = field.type === 'object'
  const isArrayType = field.type === 'array'

  return (
    <div className="field-container" style={{ marginLeft: `${level * 20}px` }}>
      <div className="field-header">
        <input
          type="text"
          placeholder="字段名"
          value={field.name}
          onChange={(e) => onUpdate(field.id, { name: e.target.value })}
        />
        <select
          value={field.type}
          onChange={(e) => {
            const newType = e.target.value
            onUpdate(field.id, { 
              type: newType,
              // 清除不相关的子字段配置
              items: newType !== 'array' ? undefined : field.items,
              properties: newType !== 'object' ? undefined : field.properties
            })
          }}
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
          <option value="array">array</option>
          <option value="null">null</option>
        </select>
        <input
          type="text"
          placeholder="描述"
          value={field.description || ''}
          onChange={(e) => onUpdate(field.id, { description: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
          />
          必填
        </label>
        <button className="delete-btn" onClick={() => onDelete(field.id)}>删除</button>
      </div>

      {/* object类型的properties */}
      {isObjectType && field.properties && (
        <div className="sub-fields">
          <div className="sub-field-header">
            <h4>Properties:</h4>
            <button onClick={() => onAddSubField(field.id, 'properties')}>添加属性</button>
          </div>
          {field.properties.map((prop) => (
            <FieldComponent
              key={prop.id}
              field={prop}
              onUpdate={onUpdate}
              onAddSubField={onAddSubField}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* array类型的items */}
      {isArrayType && (
        <div className="sub-fields">
          <div className="sub-field-header">
            <h4>Items:</h4>
            {!field.items?.length && (
              <button onClick={() => onAddSubField(field.id, 'items')}>添加数组项类型</button>
            )}
          </div>
          {field.items?.map((item) => (
            <FieldComponent
              key={item.id}
              field={item}
              onUpdate={onUpdate}
              onAddSubField={onAddSubField}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  // 初始化字段数组
  const [fields, setFields] = useState<Field[]>([])
  const [jsonSchema, setJsonSchema] = useState<string>('')

  // 添加新字段
  const addField = () => {
    const newField: Field = {
      id: generateId(),
      name: '',
      type: 'string',
      properties: []
    }
    setFields([...fields, newField])
  }

  // 更新字段
  const updateField = (id: string, updates: Partial<Field>) => {
    const updateFieldInArray = (fieldArray: Field[]): Field[] => {
      return fieldArray.map(field => {
        if (field.id === id) {
          return { ...field, ...updates }
        }
        // 递归更新子字段
        if (field.properties) {
          field.properties = updateFieldInArray(field.properties)
        }
        if (field.items) {
          field.items = updateFieldInArray(field.items)
        }
        return field
      })
    }
    setFields(updateFieldInArray(fields))
  }

  // 添加子字段
  const addSubField = (parentId: string, fieldType: 'items' | 'properties') => {
    const newSubField: Field = {
      id: generateId(),
      name: '',
      type: 'string',
      properties: []
    }

    const addSubFieldInArray = (fieldArray: Field[]): Field[] => {
      return fieldArray.map(field => {
        if (field.id === parentId) {
          if (fieldType === 'properties') {
            field.properties = [...(field.properties || []), newSubField]
          } else if (fieldType === 'items') {
            field.items = [newSubField]
          }
        }
        // 递归添加到子字段
        if (field.properties) {
          field.properties = addSubFieldInArray(field.properties)
        }
        if (field.items) {
          field.items = addSubFieldInArray(field.items)
        }
        return field
      })
    }

    setFields(addSubFieldInArray(fields))
  }

  // 删除字段
  const deleteField = (id: string) => {
    const deleteFieldFromArray = (fieldArray: Field[]): Field[] => {
      return fieldArray.filter(field => {
        if (field.id === id) {
          return false
        }
        // 递归删除子字段
        if (field.properties) {
          field.properties = deleteFieldFromArray(field.properties)
        }
        if (field.items) {
          field.items = deleteFieldFromArray(field.items)
        }
        return true
      })
    }
    setFields(deleteFieldFromArray(fields))
  }

  // 生成JSON Schema
  const generateSchema = () => {
    // 递归生成schema
    const buildSchema = (fieldArray: Field[]): any => {
      const schema: any = {
        type: 'object',
        properties: {},
        required: []
      }

      fieldArray.forEach(field => {
        if (!field.name) return // 跳过未命名的字段

        const fieldSchema: any = {
          type: field.type
        }

        if (field.description) {
          fieldSchema.description = field.description
        }

        // 处理object类型
        if (field.type === 'object' && field.properties && field.properties.length > 0) {
          const nestedSchema = buildSchema(field.properties)
          fieldSchema.properties = nestedSchema.properties
          fieldSchema.required = nestedSchema.required
        }

        // 处理array类型
        if (field.type === 'array' && field.items && field.items.length > 0) {
          const itemSchema = field.items[0]
          fieldSchema.items = {
            type: itemSchema.type
          }
          
          if (itemSchema.type === 'object' && itemSchema.properties && itemSchema.properties.length > 0) {
            const nestedSchema = buildSchema(itemSchema.properties)
            fieldSchema.items.properties = nestedSchema.properties
            fieldSchema.items.required = nestedSchema.required
          }
          
          if (itemSchema.description) {
            fieldSchema.items.description = itemSchema.description
          }
        }

        schema.properties[field.name] = fieldSchema
        if (field.required) {
          schema.required.push(field.name)
        }
      })

      // 如果没有必填字段，删除required数组
      if (schema.required.length === 0) {
        delete schema.required
      }

      return schema
    }

    const schema = buildSchema(fields)
    setJsonSchema(JSON.stringify(schema, null, 2))
  }

  // 复制JSON Schema到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonSchema)
  }

  return (
    <div className="app">
      <h1>JSON Schema 生成器</h1>
      
      <div className="schema-builder">
        <div className="builder-controls">
          <button onClick={addField}>添加字段</button>
          <button onClick={generateSchema}>生成 JSON Schema</button>
        </div>
        
        <div className="fields-container">
          {fields.length === 0 ? (
            <p className="empty-message">暂无字段，请点击"添加字段"开始</p>
          ) : (
            fields.map((field) => (
              <FieldComponent
                key={field.id}
                field={field}
                onUpdate={updateField}
                onAddSubField={addSubField}
                onDelete={deleteField}
              />
            ))
          )}
        </div>
      </div>

      <div className="schema-output">
        <h2>生成的 JSON Schema</h2>
        <div className="schema-controls">
          <button onClick={copyToClipboard} disabled={!jsonSchema}>复制到剪贴板</button>
        </div>
        <pre className="schema-code">{jsonSchema || '点击"生成 JSON Schema"查看结果'}</pre>
      </div>
    </div>
  )
}

export default App

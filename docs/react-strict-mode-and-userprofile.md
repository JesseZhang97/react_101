# React Strict Mode 双调用与 UserProfile 渲染流程

## 背景
本项目中 `UserProfile` 在首次加载时出现 `user` 与 `error` 同时渲染的异常。开发环境日志显示组件首次挂载出现 `mount → cleanup → mount` 序列，并打印了两个随机数。这与 React 18 开发模式下的 StrictMode 双调用行为一致。

## StrictMode 的双调用是什么
- 在开发模式（非 production）且组件被 `<React.StrictMode>` 包裹时，React 会对“首次挂载”的副作用做一次压力测试：模拟 `mount → unmount → mount`。
- 结果：
  - 函数组件在初次渲染时会执行两次初始化逻辑（中间伴随一次清理）。
  - `useEffect`/`useLayoutEffect` 的 setup 函数会执行两次，第一次执行后的清理函数会被调用一次。
- 目的：帮助发现不安全的副作用（如不可重入的订阅、未清理的定时器等）。
- 生产环境：生产构建不会进行这类双调用，但并发/快速多次交互仍可能触发竞态，因此副作用仍需“可取消、可去重、互斥更新”。

## 为什么会发生在本例
- `UserProfile` 在首次挂载后通过 `useEffect(..., [])` 调用 `fetchUser()` 启动 `setTimeout` 模拟请求。
- 在 StrictMode 下，该 `useEffect` 首次会执行两次（中间清理一次），等效于启动了两个独立的定时器，所以会打印两个随机数。
- 由于回调里只设置了 `user` 或 `error`，但没有互斥地清空另一个字段，且 UI 使用两个独立的条件块渲染（`{user && ...}{error && ...}`），就可能出现两块一起显示。

## 如何验证双调用
- 日志：在组件函数体与 effect 中加入 `console.log`，观察 `render / effect mount / effect cleanup / effect mount` 的顺序。
- 测试：在测试里用 `<StrictMode>` 包裹组件，spy `setTimeout`，断言被调用两次；移除 `<StrictMode>` 后应变为一次。

## 对策与修复建议
1. 结果互斥清空（最小修复）
   - 成功时 `setError(null)`；失败时 `setUser(null)`，保证任意时刻两者不同时为真。
2. 去重/取消并发
   - 保存计时器句柄：新请求来时 `clearTimeout` 旧的；或维护“请求序号”，只接收最后一次响应。
3. 加载期间禁用重复触发
   - `disabled={loading}` 避免手动并发请求。
4. 首次守卫（开发/测试环境）
   - 用 `useRef` 防止 `useEffect` 在 StrictMode 的二次初始化时重复触发首个加载。

示例（综合实现）：
```tsx
// 片段：在 UserProfile 内补充
const didInitRef = useRef(false)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const reqIdRef = useRef(0)

const fetchUser = () => {
  if (timerRef.current) clearTimeout(timerRef.current) // 取消旧请求
  const id = ++reqIdRef.current
  setLoading(true)
  setError(null)
  setUser(null)
  setRandomNumber(null)

  timerRef.current = setTimeout(() => {
    if (id !== reqIdRef.current) return // 忽略过期响应
    const random = Math.random()
    setRandomNumber(random)
    if (random > 0.7) {
      setError('Failed to load user data')
      setUser(null) // 失败→互斥
    } else {
      setUser({ name: 'Jesse Zhang', email: 'zz597375428@gmail.com' })
      setError(null) // 成功→互斥
    }
    setLoading(false)
  }, 2000)
}

useEffect(() => {
  if (didInitRef.current) return // StrictMode 首次守卫
  didInitRef.current = true
  fetchUser()
  return () => { if (timerRef.current) clearTimeout(timerRef.current) }
}, [])
```

## UserProfile 的渲染过程
1. 初始渲染
   - 初始化状态：`user=null`、`loading=true`、`error=null`、`randomNumber=null`。
   - 条件渲染：只显示 Loading。
2. 副作用阶段
   - 首次提交后 `useEffect(..., [])` 异步执行，调用 `fetchUser()` 启动定时器。
3. “请求”返回后
   - 设置 `randomNumber`，根据结果设置 `user` 或 `error`，并将 `loading=false`。
4. 第二次渲染
   - 成功：显示用户信息；失败：显示错误信息。
5. 用户点击 Reload
   - 重复“重置 → Loading → 定时器 → 渲染”的流程。
6. StrictMode（开发/测试）
   - 首次装载时 `useEffect` 会被执行两次（中间清理一次），因此若未做互斥与去重，可能出现 `user`、`error` 同时为真与日志重复。

## 小结
- 双调用是 React 18 开发模式下的严格模式行为，意在发现不安全副作用。
- 生产环境不会触发双调用，但并发交互仍可能引发竞态，因此副作用应写成：可取消、可去重、互斥更新，并在 UI 上采用互斥渲染或早返回策略。
```

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  use,
  useRef,
} from 'react'

interface SectionProps {
  number: number
  title: string
  description: string
  children: React.ReactNode
}

function Section({ number, title, description, children }: SectionProps) {
  return (
    <>
      {/* tutorial-section */}
      <div className="mb-12 flex w-full flex-col items-center">
        {/* section-inner */}
        <div className="mx-auto my-0 flex w-full max-w-[900px] flex-col px-4 py-0">
          {/* section-header */}
          <div className="mb-6 flex items-center gap-2 border-b-2 border-gray-300 pb-3">
            {/* pattern-number */}
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {number}
            </div>
            <div>
              {/* section-title */}
              <div className="text-xl font-semibold">{title}</div>
              {/* section-description */}
              <div className="mx-0 text-sm text-gray-400">{description}</div>
            </div>
          </div>
          {/*card*/}
          {children}
        </div>
      </div>
    </>
  )
}

function Counter() {
  const [count, setCount] = useState(0)
  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)
  const reset = () => setCount(0)
  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>🔢 Counter Widget</h3>
          <div className="badge badge-soft badge-info">useState</div>
        </div>
        {/* card-content*/}
        <div className="mb-4 text-center">
          {/* count number*/}
          <div className="my-4 text-3xl font-bold">{count}</div>
          <p className="my-4 text-sm text-gray-400">
            Click button to see automatic re-renders
          </p>
          <div className="text-sm text-gray-400">
            <div className="flex flex-3 justify-center gap-2">
              <button className="btn btn-warning" onClick={decrement}>
                -
              </button>
              <button className="btn btn-default" onClick={reset}>
                Reset
              </button>
              <button className="btn btn-success" onClick={increment}>
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState<Date | null>(null)
  const [showBadExample, setShowBadExample] = useState(false)
  useEffect(() => {
    if (!showBadExample) {
      setTime(new Date())
      const timer = setInterval(() => {
        setTime(new Date())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showBadExample])

  return (
    <>
      <div className="card bg-base-100 card-lg w-full shadow-sm">
        <div className="card-body">
          <div className="card-title">
            <h3>⏰ Live Clock</h3>
            <div className="badge badge-soft badge-info">useEffect</div>
          </div>
          {/* card-content*/}
          <div className="mb-2 text-center">
            {/* count number*/}
            <button
              className={`btn ${showBadExample ? 'btn-error' : 'btn'}`}
              onClick={() => setShowBadExample(!showBadExample)}
            >
              {showBadExample ? '🛑Stop Bad Demo' : '🔥 Show Bad Example'}
            </button>
          </div>
          {/*visual feedback*/}
          {showBadExample && (
            // TODO: text center bug
            <div
              role="alert"
              className="alert alert-error alert-soft text-center"
            >
              <span>Error! Task failed successfully.</span>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold">
              {time ? time.toLocaleTimeString() : '--:--:-- --'}
            </div>
          </div>
          <p className="my-4 text-center text-sm text-gray-400">
            {showBadExample
              ? 'Using setTimeout in render (creating memory leaks!)'
              : 'Updates every second with automatic cleanup'}
          </p>
        </div>
      </div>
    </>
  )
}

interface ButtonProps {
  variant?: 'primary' | 'neutral' | 'info' | 'error' | 'accent' | 'success'
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  className?: string
}

function Button({
  variant = 'neutral',
  children,
  onClick,
  disabled = false,
  type = 'button',
  style,
  className,
}: ButtonProps) {
  // Avoid dynamic class names so Tailwind JIT can see all used classes.
  // If we do `btn-${variant}`, Tailwind may purge the variant classes
  // (e.g. btn-neutral/btn-info) because it can't detect them at build time.
  const variantClassMap: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'btn-primary',
    neutral: 'btn-neutral',
    info: 'btn-info',
    error: 'btn-error',
    accent: 'btn-accent',
    success: 'btn-success',
  }
  const variantClass = variantClassMap[variant] ?? ''

  return (
    <button
      className={`btn ${variantClass} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={style}
    >
      {children}
    </button>
  )
}

function ButtonShowcase() {
  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>🎨 Button Variants</h3>
          <div className="badge badge-soft badge-info">Props</div>
        </div>
        <p className="text-sm text-gray-400">
          One component, multiple styles via props
        </p>
        {/* card-content*/}
        <div className="flex flex-row justify-center gap-4">
          <Button variant="neutral" onClick={() => alert('Neutral!')}>
            Neutral Button
          </Button>
          <Button variant="info" onClick={() => alert('Info!')}>
            Info Button
          </Button>
          <Button variant="error" onClick={() => alert('Error!')}>
            Error Button
          </Button>
          <Button variant="success" onClick={() => alert('Success!')}>
            Success Button
          </Button>
          <Button variant="success" disabled>
            Disabled Button
          </Button>
        </div>
      </div>
    </div>
  )
}

interface User {
  name: string
  email: string
}

function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [randomNumber, setRandomNumber] = useState<number | null>(null)

  const fetchUser = () => {
    setLoading(true)
    setError(null)
    setUser(null)
    setRandomNumber(null)

    // Simulate API call
    setTimeout(() => {
      const random = Math.random()
      setRandomNumber(random)
      console.log('Random number:', random)

      if (random > 0.7) {
        setError('Failed to load user data')
        setUser(null)
      } else {
        setUser({
          name: 'Jesse Zhang',
          email: 'zz597375428@gmail.com',
        })
        setError(null)
      }
      setLoading(false)
    }, 2000)
  }

  useEffect(() => {
    console.log('[UserProfile] effect mount')
    fetchUser()
    return () => {
      console.log('[UserProfile] effect cleanup')
    }
  }, [])
  // useEffect(() => {
  //   fetchUser()
  // }, [])

  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>👤 User Profile</h3>
          <div className="badge badge-soft badge-info">Conditional</div>
        </div>
        {/* card-content*/}
        {!loading && !error && !user && (
          <div className="p-8 text-center">
            <div className="status-loading">Please log in</div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center">
            <div className="flex">
              <span className="loading loading-dots loading-lg"></span>
              <p>Loading userdata...</p>
            </div>
          </div>
        )}
        {user && (
          <div>
            <div id="loadSuccess" className="">
              <div className="text-green-500">✅ User loaded successfully!</div>
              <div className="flex justify-center text-gray-400">
                Random number:
                <strong>{randomNumber?.toFixed(3)}</strong>
                <span className="text-green-400">(≤ 0.7 = Success)</span>
              </div>
              <div className="mt-4">
                <p className="my-2">
                  <strong>Name:</strong>
                  {user.name}
                </p>
                <p className="my-2">
                  <strong>Email:</strong>
                  {user.email}
                </p>
              </div>
            </div>
            <Button className="mt-4" variant="info" onClick={fetchUser}>
              Reload User
            </Button>
          </div>
        )}
        {error && (
          <div className="p-8 text-center">
            <div id="loadFailed" className="text-center">
              <div className="text-red-600">❌ Failed to load user data</div>
              <div className="mt-4 flex justify-center text-gray-400">
                Random number:
                <strong>{randomNumber?.toFixed(3)}</strong>
                <span className="text-red-400">(&gt; 0.7 = Error)</span>
              </div>
            </div>
            <Button variant="error" onClick={fetchUser} className="mt-4">
              Reload User
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function TodoList() {
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: 'Learn React useState',
      completed: true,
    },
    { id: 2, text: 'Master useEffect', completed: true },
    { id: 3, text: 'Understand props', completed: false },
    {
      id: 4,
      text: 'Practice conditional rendering',
      completed: false,
    },
    { id: 5, text: 'Build awesome apps', completed: false },
  ])
  const completeCount = todos.filter((todo) => todo.completed).length

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const checkedStyle = 'text-gray-500 line-through bg-gray-50 opacity-75'
  const uncheckedStyle = 'text-gray-900 hover:bg-gray-100'

  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>📝 Learning Checklist</h3>
          <div className="badge badge-soft badge-info">List Rendering</div>
        </div>
        {/*content*/}
        {/*progress*/}
        <div>
          <p>
            Progress: {completeCount}/{todos.length} completed
          </p>
          <progress
            className="progress progress-accent w-full"
            value={completeCount}
            max={todos.length}
          ></progress>
          {/*todo list*/}
        </div>
        {/*todo list*/}
        <div>
          {todos.map((todo) => (
            <div
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              className={`flex cursor-pointer items-center rounded p-5 transition-colors duration-200 ${todo.completed ? checkedStyle : uncheckedStyle} `}
            >
              <span className="mr-2"> {todo.completed ? '✅' : '⬜'}</span>
              {todo.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SubmittedFormData {
  id: number
  name: string
  email: string
  message: string
  submittedAt: string
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    messgae: '',
  })

  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>📧 Contact Form</h3>
          <div className="badge badge-soft badge-info">Forms</div>
        </div>
        <p className="text-sm text-gray-400">
          Controlled components with validation and multiple data persistence
        </p>
        {/*content*/}
        <div className="grid grid-cols-2 gap-6">
          {/*submit*/}
          <div className="flex flex-1 flex-col">
            <h4 className="mb-4 text-sm font-semibold text-gray-400">
              📝 Submit Message
            </h4>
            <form>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="input w-full"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Your email"
                  className="input w-full"
                />
              </div>
              <div className="mb-4">
                <textarea
                  className="textarea w-full"
                  placeholder="Bio"
                ></textarea>
              </div>
              <div className="mb-4">
                <Button variant="primary">Send Message</Button>
              </div>
            </form>
          </div>
          {/*history*/}
          <div>
            <h4 className="mb-4 text-lg font-bold">📋 Message History</h4>
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
              <div className="mb-4 inline-flex h-15 w-15 items-center justify-center rounded-full border-2 border-purple-300 bg-purple-100">
                <span className="text-2xl">📭</span>
              </div>
              <h3 className="mb-2 flex text-lg font-bold">No Messages Yet</h3>
              <p className="m-3 text-sm text-gray-500">
                Submit your first message using the form to see it beautifully
                displayed here!
              </p>
              <div className="mt-4 inline-block rounded-full border-1 border-purple-300 bg-purple-100 px-4 py-2 text-sm text-purple-600">
                ✨ Ready for your first message
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    messgae: '',
  })

  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>🎨 Theme Switcher</h3>
          <div className="badge badge-soft badge-info">Context API</div>
        </div>
        <p className="text-sm text-gray-400">
          Global state without prop drilling
        </p>
        {/*content*/}
        <div className="text-center">
          <div className="mb-4 text-xl">Current theme:</div>
          <Button variant="primary">Switch to 🌙 Dark mode</Button>
        </div>
      </div>
    </div>
  )
}

function NotesWidget() {
  return (
    <div className="card bg-base-100 card-lg w-full shadow-sm">
      <div className="card-body">
        <div className="card-title">
          <h3>📚 Smart Notes</h3>
          <div className="badge badge-soft badge-info">Custom Hooks</div>
        </div>
        {/*content*/}
        <div>
          <div className="grid grid-cols-3 gap-2 rounded bg-gray-100 p-3 text-center">
            <div>
              <div>1</div>
              <div>Notes</div>
            </div>
            <div>
              <div>1</div>
              <div>Long</div>
            </div>
            <div>
              <div>1</div>
              <div>Avg chars</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type here"
            className="input min-w-0 flex-1"
          />
          <Button variant="primary">Add</Button>
        </div>
        {/*notes list*/}
        <div className="max-h-48 overflow-y-auto">
          <div className="flex cursor-pointer items-center rounded p-5 text-gray-900 transition-colors duration-200 hover:bg-gray-100">
            jesse zhang test
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <>
      {/* section 1 */}
      {/* dashboard-center */}
      <div className="flex min-h-screen w-full flex-col items-center justify-start">
        <Section
          number={1}
          title="State Management"
          description="useState + useEffect - The doundation of React components"
        >
          <div className="grid gap-6">
            <Counter />
            <Clock />
          </div>
        </Section>
        {/* section 2 */}
        {/* dashboard-center */}
        <Section
          number={2}
          title="Component Architecture"
          description="Props & Composition - Building reusable components"
        >
          <div className="grid gap-6">
            <ButtonShowcase />
          </div>
        </Section>
        {/* section 3 */}
        {/* dashboard-center */}
        <Section
          number={3}
          title="Conditional Rendering"
          description="Showing the right content at the right time (Loading states, error states, feature flags)"
        >
          <div className="grid gap-6">
            <UserProfile />
          </div>
        </Section>
        {/* section 4 */}
        <Section
          number={4}
          title="Data Display"
          description="List Rendering & Keys - Efficiently displaying arrays of data"
        >
          <div className="grid gap-6">
            <TodoList />
          </div>
        </Section>
        {/* section 5 */}
        <Section
          number={5}
          title="User Interaction"
          description="Event Handling & Froms - Managing user input and validation"
        >
          <div className="grid gap-6">
            <ContactForm />
          </div>
        </Section>
        {/* section 6 */}
        <Section
          number={6}
          title="Global State"
          description="Context API - Sharing state across components without prop drilling - useCallback"
        >
          <div className="grid gap-6">
            <ThemeToggle />
          </div>
        </Section>
        {/* section 7 */}
        <Section
          number={7}
          title="Advanced Patterns"
          description="Custom Hooks & Performance - Reusable logic and optimization"
        >
          <div className="grid gap-6">
            <NotesWidget />
          </div>
        </Section>
      </div>
    </>
  )
}
export default function Dashboard() {
  return <DashboardContent />
}

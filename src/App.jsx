import './App.css'
import Dashboard from './component/dashboard'

function App() {
  return (
    <>
      <header className="border-b border-gray-300 mb-8 py-6 px-0">
        {/* container*/}
        <div className="m-auto px-6 items-center max-w-[1200]">
          <h1 className="text-3xl font-bold mb-2">🚀 React Mastery Tutorial</h1>
          <p className="text-gray-400">
            Master the 8 essential React Patterns that cover 95% of use cases.
          </p>
        </div>
      </header>

      <main>
        <Dashboard />
      </main>
    </>
  )
}

export default App

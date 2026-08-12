import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api'

const statusOptions = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description || 'No description provided.'}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{task.priority.toLowerCase()}</span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{task.status.replace('_', ' ').toLowerCase()}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
        <div>Due: {task.due_date || 'Not set'}</div>
        <div>Updated: {new Date(task.updated_at).toLocaleDateString()}</div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => onEdit(task)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
          Edit
        </button>
        <button onClick={() => onDelete(task.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">
          Delete
        </button>
      </div>
    </div>
  )
}

function TaskForm({ initial, onSubmit, onClose, loading }) {
  const [task, setTask] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'TODO',
    priority: initial?.priority || 'MEDIUM',
    due_date: initial?.due_date || '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setTask((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    setTask({
      title: initial?.title || '',
      description: initial?.description || '',
      status: initial?.status || 'TODO',
      priority: initial?.priority || 'MEDIUM',
      due_date: initial?.due_date || '',
    })
  }, [initial])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(task)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            name="title"
            value={task.title}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            rows="4"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Due date</label>
          <input
            type="date"
            name="due_date"
            value={task.due_date}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

export default function DashboardPage() {
  const { auth, setAuth } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const loadTasks = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchTasks(auth, setAuth)
      setTasks(data)
    } catch (err) {
      setError('Unable to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const setAuthState = (nextAuth) => {
    localStorage.setItem('task-manager-auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }

  const handleSignOut = () => {
    const nextAuth = { access: null, refresh: null, user: null }
    localStorage.removeItem('task-manager-auth')
    setAuth(nextAuth)
  }

  const handleSaveTask = async (taskData) => {
    setFormLoading(true)
    setError('')

    try {
      let result
      if (activeTask) {
        result = await updateTask(activeTask.id, taskData, auth, setAuth)
        setTasks((prev) => prev.map((item) => (item.id === result.id ? result : item)))
      } else {
        result = await createTask(taskData, auth, setAuth)
        setTasks((prev) => [result, ...prev])
      }
      setShowForm(false)
      setActiveTask(null)
    } catch (err) {
      setError('Unable to save task. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditTask = (task) => {
    setActiveTask(task)
    setShowForm(true)
  }

  const handleDeleteTask = async (taskId) => {
    setError('')
    setFormLoading(true)
    try {
      await deleteTask(taskId, auth, setAuth)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (err) {
      setError('Unable to delete task. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const taskCount = useMemo(() => tasks.length, [tasks])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Task Manager</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your tasks</h1>
            <p className="mt-2 text-sm text-slate-600">Manage the work that matters today.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                setActiveTask(null)
                setShowForm(true)
              }}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New task
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
            <p className="mt-4 text-lg font-semibold text-slate-900">{auth.user || 'User'}</p>
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Tasks</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{taskCount}</p>
            </div>
          </aside>

          <main>
            {showForm && (
              <TaskForm
                initial={activeTask}
                onSubmit={handleSaveTask}
                onClose={() => {
                  setShowForm(false)
                  setActiveTask(null)
                }}
                loading={formLoading}
              />
            )}

            {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-center text-slate-600">Loading tasks…</div>
            ) : tasks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-center">
                <p className="text-lg font-semibold text-slate-900">No tasks yet</p>
                <p className="mt-2 text-sm text-slate-600">Create your first task to stay organized.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add task
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

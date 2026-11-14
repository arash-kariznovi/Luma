import { useEffect, useState } from 'react'
import BrandMark from './BrandMark.jsx'
import { createTask, deleteTask, getTasks, updateTask, updateTaskStatus } from '../services/tasks.js'

const taskTones = ['violet', 'blue', 'peach']

const activity = [
  { initials: 'AM', name: 'Alex Morgan', action: 'shared a new update', time: '12 min ago', tone: 'activity-avatar--peach' },
  { initials: 'JL', name: 'Jamie Lee', action: 'completed a task', time: '1 hour ago', tone: 'activity-avatar--blue' },
  { initials: 'SK', name: 'Sam Kim', action: 'left a comment', time: '3 hours ago', tone: 'activity-avatar--green' },
]

function Dashboard({ username, onSignOut }) {
  const [tasks, setTasks] = useState([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [taskError, setTaskError] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)

  useEffect(() => {
    let isCurrent = true
    getTasks()
      .then((loadedTasks) => {
        if (isCurrent) setTasks(loadedTasks)
      })
      .catch((error) => {
        if (isCurrent) setTaskError(error.message)
      })
      .finally(() => {
        if (isCurrent) setIsLoadingTasks(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  async function handleCreateTask(event) {
    event.preventDefault()
    setIsSavingTask(true)
    setTaskError('')
    try {
      const task = await createTask(taskTitle.trim(), taskDescription.trim())
      setTasks((currentTasks) => [task, ...currentTasks])
      setTaskTitle('')
      setTaskDescription('')
      setShowTaskForm(false)
    } catch (error) {
      setTaskError(error.message)
    } finally {
      setIsSavingTask(false)
    }
  }

  async function handleDeleteTask(taskId) {
    setTaskError('')
    try {
      await deleteTask(taskId)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      setTaskError(error.message)
    }
  }

  async function handleToggleTask(task) {
    const status = task.status === 'completed' ? 'pending' : 'completed'
    setTaskError('')
    try {
      const updatedTask = await updateTaskStatus(task.id, status)
      setTasks((currentTasks) => currentTasks.map((item) => (
        item.id === task.id ? updatedTask : item
      )))
    } catch (error) {
      setTaskError(error.message)
    }
  }

  function handleStartEditing(task) {
    setEditingTaskId(task.id)
    setEditTaskTitle(task.title)
    setEditTaskDescription(task.description || '')
    setTaskError('')
  }

  async function handleUpdateTask(event, taskId) {
    event.preventDefault()
    setIsUpdatingTask(true)
    setTaskError('')
    try {
      const updatedTask = await updateTask(taskId, {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim(),
      })
      setTasks((currentTasks) => currentTasks.map((task) => (
        task.id === taskId ? updatedTask : task
      )))
      setEditingTaskId(null)
    } catch (error) {
      setTaskError(error.message)
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <main className="dashboard">
      <aside className="dashboard-sidebar">
        <BrandMark />
        <p className="dashboard-nav-label">WORKSPACE</p>
        <nav className="dashboard-nav" aria-label="Workspace">
          <a className="dashboard-nav__item dashboard-nav__item--active" href="#overview">
            <span aria-hidden="true">⌂</span> Overview
          </a>
          <a className="dashboard-nav__item" href="#my-tasks">
            <span aria-hidden="true">✓</span> My tasks
            <span className="dashboard-nav__count">{tasks.length}</span>
          </a>
          <a className="dashboard-nav__item" href="#projects">
            <span aria-hidden="true">▦</span> Projects
          </a>
          <a className="dashboard-nav__item" href="#team">
            <span aria-hidden="true">♧</span> Team
          </a>
        </nav>

        <div className="dashboard-sidebar__bottom">
          <div className="workspace-card">
            <span className="workspace-card__icon">L</span>
            <span>
              <strong>Personal space</strong>
              <small>Free workspace</small>
            </span>
            <span className="workspace-card__dots" aria-hidden="true">···</span>
          </div>
          <button className="dashboard-signout" type="button" onClick={onSignOut}>
            <span aria-hidden="true">↪</span> Sign out
          </button>
        </div>
      </aside>

      <section className="dashboard-main" id="overview">
        <header className="dashboard-topbar">
          <span className="dashboard-breadcrumb">Workspace <span>/</span> Overview</span>
          <div className="dashboard-account">
            <button className="dashboard-icon-button" type="button" aria-label="Notifications">
              ♧<i aria-hidden="true" />
            </button>
            <span className="dashboard-user-avatar" aria-hidden="true">
              {(username || 'U').slice(0, 1).toUpperCase()}
            </span>
            <span className="dashboard-account__name">{username || 'Your account'}</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-date">{today}</p>
              <h1>Good afternoon{username ? `, ${username}` : ''} <span>✦</span></h1>
              <p>Here’s what’s happening in your workspace today.</p>
            </div>
            <button className="dashboard-create" type="button" onClick={() => setShowTaskForm(true)}>
              <span aria-hidden="true">＋</span> Create new
            </button>
          </div>

          <div className="dashboard-stats" aria-label="Workspace summary">
            <article className="stat-card">
              <span className="stat-card__icon stat-card__icon--purple">▦</span>
              <span className="stat-card__label">Active projects</span>
              <strong>08</strong>
              <small><b>+2</b> this month</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__icon stat-card__icon--orange">✓</span>
              <span className="stat-card__label">Tasks completed</span>
              <strong>24</strong>
              <small><b>+12%</b> from last week</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__icon stat-card__icon--green">♧</span>
              <span className="stat-card__label">Team members</span>
              <strong>12</strong>
              <small>Across <b>4 teams</b></small>
            </article>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card task-card" id="my-tasks">
              <div className="dashboard-card__heading">
                <div>
                  <h2>Your tasks</h2>
                  <p>A little progress goes a long way.</p>
                </div>
                <a href="#my-tasks">View all <span aria-hidden="true">→</span></a>
              </div>
              <button
                className="task-add-button"
                type="button"
                onClick={() => setShowTaskForm((isVisible) => !isVisible)}
              >
                {showTaskForm ? 'Cancel' : '+ Add task'}
              </button>
              {showTaskForm && (
                <form className="task-form" onSubmit={handleCreateTask}>
                  <label htmlFor="task-title">Task name</label>
                  <input
                    id="task-title"
                    maxLength={200}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="What needs to be done?"
                    required
                    value={taskTitle}
                  />
                  <label htmlFor="task-description">Description <span>(optional)</span></label>
                  <textarea
                    id="task-description"
                    maxLength={2000}
                    onChange={(event) => setTaskDescription(event.target.value)}
                    placeholder="Add a few details"
                    rows={2}
                    value={taskDescription}
                  />
                  <button className="task-form__submit" type="submit" disabled={isSavingTask || !taskTitle.trim()}>
                    {isSavingTask ? 'Adding…' : 'Add task'}
                  </button>
                </form>
              )}
              {taskError && <p className="task-message task-message--error" role="alert">{taskError}</p>}
              {isLoadingTasks ? (
                <p className="task-message">Loading tasks…</p>
              ) : tasks.length ? (
                <ul className="task-list">
                  {tasks.map((task, index) => (
                    <li className={`task-item${task.status === 'completed' ? ' task-item--completed' : ''}`} key={task.id}>
                      {editingTaskId === task.id ? (
                        <form className="task-edit-form" onSubmit={(event) => handleUpdateTask(event, task.id)}>
                          <input
                            aria-label="Task name"
                            maxLength={200}
                            onChange={(event) => setEditTaskTitle(event.target.value)}
                            required
                            value={editTaskTitle}
                          />
                          <textarea
                            aria-label="Task description"
                            maxLength={2000}
                            onChange={(event) => setEditTaskDescription(event.target.value)}
                            rows={2}
                            value={editTaskDescription}
                          />
                          <div className="task-edit-form__actions">
                            <button className="task-form__submit" type="submit" disabled={isUpdatingTask || !editTaskTitle.trim()}>
                              {isUpdatingTask ? 'Saving…' : 'Save'}
                            </button>
                            <button className="task-edit-cancel" type="button" onClick={() => setEditingTaskId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <button
                            className="task-check"
                            type="button"
                            aria-label={task.status === 'completed' ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                            aria-pressed={task.status === 'completed'}
                            onClick={() => handleToggleTask(task)}
                          />
                          <span className={`task-project-icon task-project-icon--${taskTones[index % taskTones.length]}`} aria-hidden="true">✦</span>
                          <span className="task-item__text">
                            <strong>{task.title}</strong>
                            {task.description && <small>{task.description}</small>}
                          </span>
                          <span className="task-item__due">{task.status.replace('_', ' ')}</span>
                          <button
                            className="task-edit"
                            type="button"
                            aria-label={`Edit ${task.title}`}
                            onClick={() => handleStartEditing(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="task-remove"
                            type="button"
                            aria-label={`Remove ${task.title}`}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            ×
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="task-message">No tasks yet. Add one to get started.</p>
              )}
            </section>

            <section className="dashboard-card activity-card">
              <div className="dashboard-card__heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Your team’s latest updates.</p>
                </div>
                <button className="activity-more" type="button" aria-label="More activity options">···</button>
              </div>
              <ul className="activity-list">
                {activity.map((item) => (
                  <li className="activity-item" key={item.name}>
                    <span className={`activity-avatar ${item.tone}`}>{item.initials}</span>
                    <span className="activity-item__text">
                      <span><strong>{item.name}</strong> {item.action}</span>
                      <small>{item.time}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="dashboard-tip">
            <span className="dashboard-tip__sparkle" aria-hidden="true">✦</span>
            <div>
              <strong>Make space for focused work</strong>
              <p>Block a little time on your calendar to tackle your top priority.</p>
            </div>
            <button type="button" aria-label="Dismiss tip">×</button>
          </section>
        </div>
      </section>
    </main>
  )
}

export default Dashboard

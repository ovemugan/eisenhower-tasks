'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import './dashboard.css';

interface Task {
  id: string;
  text: string;
  quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
  status: 'todo' | 'inprogress' | 'done';
  userId: string;
  createdAt: number;
}

const QUADRANT_META = {
  do: { label: 'Do first', color: '#639922', tag: 'D1' },
  schedule: { label: 'Schedule', color: '#185FA5', tag: 'SC' },
  delegate: { label: 'Delegate', color: '#BA7517', tag: 'DG' },
  eliminate: { label: 'Eliminate', color: '#888780', tag: 'EL' },
};

const STATUS_META = {
  todo: { label: 'Not started' },
  inprogress: { label: 'In progress' },
  done: { label: 'Done' },
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<'matrix' | 'list' | 'status'>('matrix');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ text: '', quadrant: 'do', status: 'todo' });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeTasks: (() => void) | null = null;

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }

      if (currentUser) {
        const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
        unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTasks(tasksData);
        });
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeTasks) unsubscribeTasks();
    };
  }, []);

  const handleAddTask = async () => {
    if (!newTask.text.trim() || !user) return;

    await addDoc(collection(db, 'tasks'), {
      text: newTask.text,
      quadrant: newTask.quadrant,
      status: newTask.status,
      userId: user.uid,
      createdAt: Date.now(),
    });

    setNewTask({ text: '', quadrant: 'do', status: 'todo' });
    setShowModal(false);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      todo: 'inprogress',
      inprogress: 'done',
      done: 'todo',
    };

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: statusCycle[currentStatus],
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Eisenhower Task Manager</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="toolbar">
        <div className="view-tabs">
          <button
            className={`tab ${currentView === 'matrix' ? 'active' : ''}`}
            onClick={() => setCurrentView('matrix')}
          >
            Matrix
          </button>
          <button
            className={`tab ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            List
          </button>
          <button
            className={`tab ${currentView === 'status' ? 'active' : ''}`}
            onClick={() => setCurrentView('status')}
          >
            Status
          </button>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add task
        </button>
      </div>

      {currentView === 'matrix' && <MatrixView tasks={tasks} onToggle={handleToggleTask} />}
      {currentView === 'list' && <ListView tasks={tasks} onToggle={handleToggleTask} />}
      {currentView === 'status' && <StatusView tasks={tasks} onToggle={handleToggleTask} />}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add new task</h3>
            <input
              type="text"
              placeholder="Task name..."
              value={newTask.text}
              onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              autoFocus
            />
            <select
              value={newTask.quadrant}
              onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value as any })}
            >
              <option value="do">Do first — Urgent + Important</option>
              <option value="schedule">Schedule — Not urgent + Important</option>
              <option value="delegate">Delegate — Urgent + Not important</option>
              <option value="eliminate">Eliminate — Not urgent + Not important</option>
            </select>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
            >
              <option value="todo">Not started</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
            <div className="modal-btns">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAddTask}>
                Add task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixView({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string, status: string) => void }) {
  return (
    <div className="matrix">
      {(['do', 'schedule', 'delegate', 'eliminate'] as const).map((q) => {
        const quadrantTasks = tasks.filter((t) => t.quadrant === q);
        const meta = QUADRANT_META[q];
        return (
          <div key={q} className="quadrant">
            <div className="q-header">
              <div className="q-dot" style={{ background: meta.color }} />
              <span className="q-label">{meta.label}</span>
            </div>
            <div className="q-tasks">
              {quadrantTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => onToggle(task.id, task.status)}
                    className="task-check"
                  />
                  <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                    {task.text}
                  </span>
                  <span className="task-tag">{STATUS_META[task.status].label}</span>
                </div>
              ))}
              {quadrantTasks.length === 0 && <div className="empty">No tasks</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string, status: string) => void }) {
  return (
    <div className="list-view">
      <div className="list-header">
        <div></div>
        <div className="list-col">Task</div>
        <div className="list-col">Quadrant</div>
        <div className="list-col">Status</div>
      </div>
      <div className="list-body">
        {tasks.map((task) => (
          <div key={task.id} className="list-row">
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => onToggle(task.id, task.status)}
            />
            <span className={`list-task-text ${task.status === 'done' ? 'done' : ''}`}>
              {task.text}
            </span>
            <span style={{ color: QUADRANT_META[task.quadrant].color, fontSize: '12px', fontWeight: 500 }}>
              {QUADRANT_META[task.quadrant].label}
            </span>
            <span style={{ fontSize: '12px' }}>{STATUS_META[task.status].label}</span>
          </div>
        ))}
        {tasks.length === 0 && <div className="empty">No tasks</div>}
      </div>
    </div>
  );
}

function StatusView({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string, status: string) => void }) {
  const statuses = ['todo', 'inprogress', 'done'] as const;

  return (
    <div className="status-cols">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="status-col">
            <div className="status-col-header">
              {STATUS_META[status].label}
              <span className="status-count">{statusTasks.length}</span>
            </div>
            <div className="status-cards">
              {statusTasks.map((task) => (
                <div key={task.id} className="status-card">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => onToggle(task.id, task.status)}
                  />
                  <div>
                    <div className="status-task-text">{task.text}</div>
                    <div className="status-task-quadrant">
                      {QUADRANT_META[task.quadrant].label}
                    </div>
                  </div>
                </div>
              ))}
              {statusTasks.length === 0 && <div className="empty">No tasks</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

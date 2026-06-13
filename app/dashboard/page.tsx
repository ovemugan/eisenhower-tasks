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
  do: { label: 'Do first', color: '#639922' },
  schedule: { label: 'Schedule', color: '#185FA5' },
  delegate: { label: 'Delegate', color: '#BA7517' },
  eliminate: { label: 'Eliminate', color: '#888780' },
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
    let taskUnsub: (() => void) | undefined = undefined;

    const authUnsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (taskUnsub) {
        taskUnsub();
        taskUnsub = undefined;
      }

      if (currentUser) {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid)
        );
        taskUnsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Task, 'id'>),
          }));
          setTasks(data);
        });
      } else {
        setTasks([]);
      }
    });

    return () => {
      authUnsub();
      if (taskUnsub) taskUnsub();
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
    const cycle: Record<string, string> = {
      todo: 'inprogress',
      inprogress: 'done',
      done: 'todo',
    };
    await updateDoc(doc(db, 'tasks', taskId), { status: cycle[currentStatus] });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Eisenhower Task Manager</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="toolbar">
        <div className="view-tabs">
          {(['matrix', 'list', 'status'] as const).map((v) => (
            <button
              key={v}
              className={`tab ${currentView === v ? 'active' : ''}`}
              onClick={() => setCurrentView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add task</button>
      </div>

      {currentView === 'matrix' && (
        <MatrixView tasks={tasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
      )}
      {currentView === 'list' && (
        <ListView tasks={tasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
      )}
      {currentView === 'status' && (
        <StatusView tasks={tasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add new task</h3>
            <input
              type="text"
              placeholder="Task name..."
              value={newTask.text}
              onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
              autoFocus
            />
            <select
              value={newTask.quadrant}
              onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value })}
            >
              <option value="do">Do first — Urgent + Important</option>
              <option value="schedule">Schedule — Not urgent + Important</option>
              <option value="delegate">Delegate — Urgent + Not important</option>
              <option value="eliminate">Eliminate — Not urgent + Not important</option>
            </select>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              <option value="todo">Not started</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
            <div className="modal-btns">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAddTask}>Add task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="matrix">
      {(['do', 'schedule', 'delegate', 'eliminate'] as const).map((q) => {
        const meta = QUADRANT_META[q];
        const qTasks = tasks.filter((t) => t.quadrant === q);
        return (
          <div key={q} className="quadrant">
            <div className="q-header">
              <div className="q-dot" style={{ background: meta.color }} />
              <span className="q-label">{meta.label}</span>
            </div>
            {qTasks.map((task) => (
              <div key={task.id} className="task-card">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggle(task.id, task.status)}
                />
                <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                  {task.text}
                </span>
                <span className="task-tag">{STATUS_META[task.status].label}</span>
                <button className="del-btn" onClick={() => onDelete(task.id)}>×</button>
              </div>
            ))}
            {qTasks.length === 0 && <div className="empty">No tasks</div>}
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="list-view">
      <div className="list-header">
        <div></div>
        <div className="list-col">Task</div>
        <div className="list-col">Quadrant</div>
        <div className="list-col">Status</div>
        <div></div>
      </div>
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
          <button className="del-btn" onClick={() => onDelete(task.id)}>×</button>
        </div>
      ))}
      {tasks.length === 0 && <div className="empty">No tasks yet</div>}
    </div>
  );
}

function StatusView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="status-cols">
      {(['todo', 'inprogress', 'done'] as const).map((s) => {
        const sTasks = tasks.filter((t) => t.status === s);
        return (
          <div key={s} className="status-col">
            <div className="status-col-header">
              {STATUS_META[s].label}
              <span className="status-count">{sTasks.length}</span>
            </div>
            {sTasks.map((task) => (
              <div key={task.id} className="status-card">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggle(task.id, task.status)}
                />
                <div style={{ flex: 1 }}>
                  <div className="status-task-text">{task.text}</div>
                  <div className="status-task-quadrant">
                    {QUADRANT_META[task.quadrant].label}
                  </div>
                </div>
                <button className="del-btn" onClick={() => onDelete(task.id)}>×</button>
              </div>
            ))}
            {sTasks.length === 0 && <div className="empty">No tasks</div>}
          </div>
        );
      })}
    </div>
  );
}

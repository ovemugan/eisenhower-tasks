'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import './dashboard.css';

const QUADRANT_META = {
  do:       { label: 'Do first',  color: '#639922', bg: '#f0f7e6' },
  schedule: { label: 'Schedule',  color: '#185FA5', bg: '#e8f1fb' },
  delegate: { label: 'Delegate',  color: '#BA7517', bg: '#fdf3e3' },
  eliminate:{ label: 'Eliminate', color: '#888780', bg: '#f5f5f4' },
};

const STATUS_META = {
  todo:       { label: 'Not started' },
  inprogress: { label: 'In progress' },
  done:       { label: 'Done' },
};

export default function Dashboard() {
  const [tasks, setTasks]           = useState([]);
  const [currentView, setCurrentView] = useState('matrix');
  const [showModal, setShowModal]   = useState(false);
  const [newTask, setNewTask]       = useState({ text: '', quadrant: 'do', status: 'todo' });
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    let taskUnsub = null;
    const authUnsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (taskUnsub) { taskUnsub(); taskUnsub = null; }
      if (currentUser) {
        const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
        taskUnsub = onSnapshot(q, (snapshot) => {
          setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
      } else {
        setTasks([]);
      }
    });
    return () => { authUnsub(); if (taskUnsub) taskUnsub(); };
  }, []);

  const handleAddTask = async () => {
    if (!newTask.text.trim() || !user) return;
    await addDoc(collection(db, 'tasks'), { ...newTask, userId: user.uid, createdAt: Date.now() });
    setNewTask({ text: '', quadrant: 'do', status: 'todo' });
    setShowModal(false);
  };

  const handleToggle = async (taskId, currentStatus) => {
    const cycle = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
    await updateDoc(doc(db, 'tasks', taskId), { status: cycle[currentStatus] });
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const handleMoveToQuadrant = async (taskId, newQuadrant) => {
    await updateDoc(doc(db, 'tasks', taskId), { quadrant: newQuadrant });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user)   return null;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Eisenhower Task Manager</h1>
        <button onClick={() => signOut(auth)} className="logout-btn">Logout</button>
      </header>

      <div className="toolbar">
        <div className="view-tabs">
          {['matrix', 'list', 'status'].map((v) => (
            <button key={v} className={`tab ${currentView === v ? 'active' : ''}`} onClick={() => setCurrentView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add task</button>
      </div>

      {currentView === 'matrix' && (
        <MatrixView tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} onMove={handleMoveToQuadrant} />
      )}
      {currentView === 'list' && (
        <ListView tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      )}
      {currentView === 'status' && (
        <StatusView tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add new task</h3>
            <input type="text" placeholder="Task name..." value={newTask.text} autoFocus
              onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }} />
            <select value={newTask.quadrant} onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value })}>
              <option value="do">Do first — Urgent + Important</option>
              <option value="schedule">Schedule — Not urgent + Important</option>
              <option value="delegate">Delegate — Urgent + Not important</option>
              <option value="eliminate">Eliminate — Not urgent + Not important</option>
            </select>
            <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
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

/* ─── MATRIX VIEW with drag & drop ─── */
function MatrixView({ tasks, onToggle, onDelete, onMove }) {
  const [draggingId, setDraggingId]     = useState(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState(null);
  const dragTask = tasks.find((t) => t.id === draggingId);

  const handleDragStart = (e, taskId) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // slight delay so the ghost image renders first
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    const el = document.getElementById(`task-${draggingId}`);
    if (el) el.classList.remove('dragging');
    setDraggingId(null);
    setDragOverQuadrant(null);
  };

  const handleDragOver = (e, quadrant) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverQuadrant(quadrant);
  };

  const handleDragLeave = () => {
    setDragOverQuadrant(null);
  };

  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    if (draggingId && dragTask && dragTask.quadrant !== quadrant) {
      onMove(draggingId, quadrant);
    }
    setDraggingId(null);
    setDragOverQuadrant(null);
  };

  return (
    <div className="matrix">
      {['do', 'schedule', 'delegate', 'eliminate'].map((q) => {
        const meta   = QUADRANT_META[q];
        const qTasks = tasks.filter((t) => t.quadrant === q);
        const isOver = dragOverQuadrant === q;
        const isDraggingFromHere = dragTask && dragTask.quadrant === q;

        return (
          <div
            key={q}
            className={`quadrant ${isOver && !isDraggingFromHere ? 'drop-target' : ''}`}
            style={isOver && !isDraggingFromHere ? { borderColor: meta.color, background: meta.bg } : {}}
            onDragOver={(e) => handleDragOver(e, q)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, q)}
          >
            <div className="q-header">
              <div className="q-dot" style={{ background: meta.color }} />
              <span className="q-label">{meta.label}</span>
              <span className="q-count">{qTasks.length}</span>
            </div>

            <div className="q-tasks">
              {qTasks.map((task) => (
                <div
                  key={task.id}
                  id={`task-${task.id}`}
                  className="task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="drag-handle" title="Drag to move">⠿</div>
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => onToggle(task.id, task.status)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                    {task.text}
                  </span>
                  <span className="task-tag">{STATUS_META[task.status].label}</span>
                  <button className="del-btn" onClick={() => onDelete(task.id)}>×</button>
                </div>
              ))}

              {isOver && !isDraggingFromHere && (
                <div className="drop-hint" style={{ borderColor: meta.color, color: meta.color }}>
                  Drop here → {meta.label}
                </div>
              )}

              {qTasks.length === 0 && !isOver && (
                <div className="empty">Drop tasks here or click + Add task</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── LIST VIEW ─── */
function ListView({ tasks, onToggle, onDelete }) {
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
          <input type="checkbox" checked={task.status === 'done'} onChange={() => onToggle(task.id, task.status)} />
          <span className={`list-task-text ${task.status === 'done' ? 'done' : ''}`}>{task.text}</span>
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

/* ─── STATUS VIEW ─── */
function StatusView({ tasks, onToggle, onDelete }) {
  return (
    <div className="status-cols">
      {['todo', 'inprogress', 'done'].map((s) => {
        const sTasks = tasks.filter((t) => t.status === s);
        return (
          <div key={s} className="status-col">
            <div className="status-col-header">
              {STATUS_META[s].label}
              <span className="status-count">{sTasks.length}</span>
            </div>
            {sTasks.map((task) => (
              <div key={task.id} className="status-card">
                <input type="checkbox" checked={task.status === 'done'} onChange={() => onToggle(task.id, task.status)} />
                <div style={{ flex: 1 }}>
                  <div className="status-task-text">{task.text}</div>
                  <div className="status-task-quadrant">{QUADRANT_META[task.quadrant].label}</div>
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

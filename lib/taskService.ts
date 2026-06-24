import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task } from './types';

const TASKS_COLLECTION = 'tasks';

/**
 * Create a new task
 */
export async function createTask(taskData: Partial<Task>): Promise<string> {
  try {
    const now = new Date();
    
    const task = {
      ...taskData,
      userId: 'demo-user', // Will update with real auth later
      status: taskData.status || 'pending',
      subtasks: taskData.subtasks || [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      deadline: taskData.deadline ? Timestamp.fromDate(taskData.deadline) : null,
    };

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        deadline: data.deadline?.toDate() || null,
        completedAt: data.completedAt?.toDate(),
      } as Task;
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string, 
  status: Task['status']
): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
      ...(status === 'completed' && { completedAt: Timestamp.fromDate(new Date()) })
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Update entire task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}
/**
 * Update task with AI suggestions
 */
export async function updateTaskWithAI(
  taskId: string,
  aiSuggestions: any
): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      aiSuggestions: {
        scheduledTime: aiSuggestions.scheduledTime ? 
          Timestamp.fromDate(aiSuggestions.scheduledTime) : null,
        breakdownSteps: aiSuggestions.breakdownSteps || [],
        recommendedDuration: aiSuggestions.recommendedDuration,
        tips: aiSuggestions.tips || []
      },
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error updating task with AI:', error);
    throw error;
  }
}
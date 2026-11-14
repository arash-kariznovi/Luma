from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskStatus, TaskUpdate


def list_tasks(db: Session, user_id: int) -> list[Task]:
    return list(
        db.scalars(
            select(Task).where(Task.user_id == user_id).order_by(Task.created_at, Task.id)
        )
    )


def create_task(db: Session, user_id: int, task_data: TaskCreate) -> Task:
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task_status(
    db: Session, user_id: int, task_id: int, status: TaskStatus
) -> Task | None:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if task is None:
        return None
    task.status = status
    db.commit()
    db.refresh(task)
    return task


def update_task(
    db: Session, user_id: int, task_id: int, task_data: TaskUpdate
) -> Task | None:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if task is None:
        return None
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = task_data.status
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, user_id: int, task_id: int) -> bool:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if task is None:
        return False
    db.delete(task)
    db.commit()
    return True

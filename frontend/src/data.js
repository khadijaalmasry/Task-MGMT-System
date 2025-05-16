// This file was used to fetch/store data from localStorage 
// before the GraphQL API was implemented.
class Student {
  constructor(id, name, password, isAdmin = false) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.isAdmin = isAdmin;
  }
}

class Project {
  constructor(id, title, description, students, category, startDate, endDate, status, progress) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.students = students;
    this.category = category;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.progress = progress;
  }
}

class Task {
  constructor(id, project, name, description, assignedStudent, status, dueDate) {
    this.id = id;
    this.project = project;
    this.name = name;
    this.description = description;
    this.assignedStudent = assignedStudent;
    this.status = status;
    this.dueDate = dueDate;
  }
}


class Message {
  constructor(sender, text, timestamp = new Date().toISOString()) {
    this.sender = sender;
    this.text = text;
    this.timestamp = timestamp;
  }
}

const students = [
  new Student(1, 'John Doe', 'password123', true),
  new Student(2, 'Jane Smith', 'password123'),
  new Student(3, 'Michael Johnson', 'password123'),
  new Student(4, 'Emily Davis', 'password123'),
  new Student(5, 'William Brown', 'password123')
];


const projects = [
  new Project(1, 'Alpha Software', 'Development of a new software application.', [students[0], students[1]], 'Software Development', '2025-01-01', '2025-12-31', 'inprogress', 30),
  new Project(2, 'Beta Software', 'Upgrade and maintenance of existing software.', [students[1], students[2]], 'Software Maintenance', '2025-02-01', '2025-11-30', 'Pending', 0),
  new Project(3, 'Gamma Software', 'Design and implementation of a software solution.', [students[2], students[3]], 'Software Design', '2025-03-01', '2025-10-31', 'Completed', 100),
  new Project(4, 'Delta Software', 'Development of a software prototype.', [students[3], students[4]], 'Software Prototyping', '2025-04-01', '2025-09-30', 'inprogress', 50),
  new Project(5, 'Epsilon Software', 'Research and development of new software technologies.', [students[0], students[4]], 'Software Research', '2025-05-01', '2025-08-31', 'inprogress', 0)
];


const tasks = [
  new Task(1, projects[0], 'Initial Planning', 'Plan the initial stages of the software development.', students[0], 'Not Started', '2025-03-01'),
  new Task(2, projects[1], 'Code Review', 'Review the existing codebase.', students[1], 'In Progress', '2025-04-01'),
  new Task(3, projects[2], 'UI Design', 'Design the user interface for the software.', students[2], 'Completed', '2025-05-01'),
  new Task(4, projects[3], 'Prototype Testing', 'Test the software prototype.', students[3], 'Not Started', '2025-06-01'),
  new Task(5, projects[0], 'Bug Fixing', 'Identify and fix bugs in the software.', students[4], 'In Progress', '2025-07-01')
];

// Only set sample data if nothing exists yet
if (!localStorage.getItem('students')) {
  localStorage.setItem('students', JSON.stringify(students));
}

if (!localStorage.getItem('projects')) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

if (!localStorage.getItem('tasks')) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}



export const saveDataToLocalStorage = ({ projects, students, tasks }) => {
  if (projects) localStorage.setItem('projects', JSON.stringify(projects));
  if (students) localStorage.setItem('students', JSON.stringify(students));
  if (tasks) localStorage.setItem('tasks', JSON.stringify(tasks));

};


// Get local data
function getDataFromLocalStorage() {
  const savedStudents = JSON.parse(localStorage.getItem('students')) || [];
  const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  return {
    students: savedStudents,
    projects: savedProjects,
    tasks: savedTasks
  };
}

export { getDataFromLocalStorage, students, projects, tasks, Message };

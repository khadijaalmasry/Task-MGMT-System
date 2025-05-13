import { gql } from '@apollo/client';



const CREATE_TASK = gql`
  mutation CreateTask(
    $name: String!
    $description: String!
    $projectId: ID!
    $assignedStudentId: ID
    $status: String!
    $dueDate: String!
  ) {
    createTask(
      name: $name
      description: $description
      projectId: $projectId
      assignedStudentId: $assignedStudentId
      status: $status
      dueDate: $dueDate
    ) {
      _id
      name
      status
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      isAdmin
      universityId
    }
  }
`;



const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $name: String
    $description: String
    $projectId: ID
    $assignedStudentId: ID
    $dueDate: String
  ) {
    updateTask(
      id: $id
      name: $name
      description: $description
      projectId: $projectId
      assignedStudentId: $assignedStudentId
      dueDate: $dueDate
    ) {
      _id
      name
      description
      dueDate
      assignedStudent {
        _id
        name
      }
      project {
        _id
        title
      }
    }
  }
`;

const SIGN_IN_MUTATION = gql`
  mutation SignIn($name: String!, $password: String!) {
    signIn(name: $name, password: $password) {
      token
      user {
        _id
        name
        isAdmin
        universityId
      }
    }
  }
`;

const SIGN_UP_MUTATION = gql`
  mutation SignUp($name: String!, $password: String!, $isAdmin: Boolean, $universityId: String) {
    signUp(name: $name, password: $password, isAdmin: $isAdmin, universityId: $universityId) {
      token
      user {
        _id
        name
        isAdmin
        universityId
      }
    }
  }
`;

const GET_ME = gql`
  query Me {
    me {
      _id
      name
    }
  }
`;

const GET_MESSAGES = gql`
  query MessagesBetweenUsers($senderId: ID, $recipientId: ID!) {
    messagesBetweenUsers(senderId: $senderId, recipientId: $recipientId) {
      _id
      sender {
        _id
        name
      }
      recipient {
        _id
        name
      }
      text
      timestamp
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage($senderId: ID!, $recipientId: ID!, $text: String!) {
    createMessage(senderId: $senderId, recipientId: $recipientId, text: $text) {
      _id
      sender {
        _id
        name
      }
      recipient {
        _id
        name
      }
      text
      timestamp
    }
  }
`;

const GET_DASHBOARD_DATA = gql`
        query GetDashboardData {
            students {
                _id
                isAdmin
            }
            projects {
                _id
                status
            }
            tasks {
                _id
            }
        }
    `;


const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      _id
      title
      description
      category
      status
      startDate
      endDate
      progress
      students {
        _id
        name
        universityId
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $title: String!
    $description: String
    $category: String
    $studentIds: [ID!]
    $startDate: String!
    $endDate: String!
  ) {
    createProject(
      title: $title
      description: $description
      category: $category
      studentIds: $studentIds
      startDate: $startDate
      endDate: $endDate
    ) {
      _id
      title
      description
      category
      status
      startDate
      endDate
      progress
      students {
        _id
        name
        universityId
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $title: String
    $description: String
    $category: String
    $studentIds: [ID!]
    $startDate: String
    $endDate: String
  ) {
    updateProject(
      id: $id
      title: $title
      description: $description
      category: $category
      studentIds: $studentIds
      startDate: $startDate
      endDate: $endDate
    ) {
      _id
      title
      description
      category
      status
      startDate
      endDate
      progress
      students {
        _id
        name
        universityId
      }
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($id: ID!, $newPassword: String!) {
    updateStudent(id: $id, password: $newPassword) {
      _id
      name
    }
  }
`;

const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`;


const GET_ALL_DATA = gql`
  query {
  tasks {
    _id
    name
    description
    status
    dueDate
    project {
      _id
      title
    }
    assignedStudent {
      _id
      name
    }
  }
  projects {
    _id
    title
    students {
      _id
      name
    }
  }
  students {
    _id
    name
  }
}
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;
const GET_TASKS = gql`
  query GetTasks {
    tasks {
      _id
      name
      description
      status
      dueDate
      project {
        _id
        title
      }
      assignedStudent {
        _id
        name
      }
    }
  }
`;

export default {CREATE_TASK, GET_STUDENTS, UPDATE_TASK,
   SIGN_IN_MUTATION, SIGN_UP_MUTATION, GET_ME,
   GET_MESSAGES, CREATE_MESSAGE, GET_DASHBOARD_DATA, 
   GET_PROJECTS, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT, 
   RESET_PASSWORD, DELETE_STUDENT, GET_ALL_DATA, DELETE_TASK, GET_TASKS};
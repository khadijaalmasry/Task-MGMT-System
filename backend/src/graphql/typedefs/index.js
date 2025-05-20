const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Student {
    _id: ID!
    name: String!
    isAdmin: Boolean
    universityId: String
  }

  type Project {
    _id: ID!
    title: String!
    description: String
    category: String
    students: [Student]
    startDate: String
    endDate: String
    status: String
    progress: Int
  }

  type Task {
    _id: ID!
    name: String
    description: String
    project: Project
    assignedStudent: Student
    status: String
    dueDate: String
  }

  type Message {
    _id: ID!
    sender: Student
    recipient: Student
    text: String!
    timestamp: String
  }

  type AuthPayload {
    token: String!
    user: Student!
  }

  type Query {
    students: [Student] @auth
    student(id: ID!): Student @auth

    projects: [Project] @auth
    project(id: ID!): Project @auth

    tasks: [Task] @auth
    task(id: ID!): Task @auth

    messages: [Message] @auth
    messagesBetweenUsers(senderId: ID, recipientId: ID!): [Message] @auth

    me: Student @auth
  }

  type Mutation {
    # Authentication
    signUp(name: String!, password: String!, isAdmin: Boolean, universityId: String): AuthPayload
    signIn(name: String!, password: String!): AuthPayload

    # Student Mutations
    updateStudent(id: ID!, name: String, password: String, isAdmin: Boolean, universityID: String): Student @auth @admin
    deleteStudent(id: ID!): Boolean @auth @admin

    # Project Mutations
    createProject(
      title: String!
      description: String
      category: String
      studentIds: [ID!]
      startDate: String
      endDate: String
    ): Project @auth @admin
    updateProject(
      id: ID!
      title: String
      description: String
      category: String
      studentIds: [ID!]
      startDate: String
      endDate: String
      status: String
    ): Project @auth @admin
    deleteProject(id: ID!): Boolean @auth @admin

    # Task Mutations
    createTask(
      name: String!
      description: String
      projectId: ID!
      assignedStudentId: ID
      status: String
      dueDate: String
    ): Task @auth
    updateTask(
      id: ID!
      name: String
      description: String
      projectId: ID
      assignedStudentId: ID
      status: String
      dueDate: String
    ): Task @auth
    deleteTask(id: ID!): Boolean @auth @admin

    # Message Mutations
    createMessage(senderId: ID!, recipientId: ID!, text: String!): Message @auth
    updateMessage(id: ID!, text: String!): Message @auth @admin
    deleteMessage(id: ID!): Boolean @auth @admin
  }

  type Subscription {
    messageAdded(recipientId: ID!): Message @auth
  }

  directive @auth on FIELD_DEFINITION
  directive @admin on FIELD_DEFINITION
`;

module.exports = typeDefs;
const Student = require('../../models/student');
const Project = require('../../models/project');
const Task = require('../../models/task');
const Message = require('../../models/message');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resolvers = {
  Query: {
    students: async (_, __, context) => {
      authMiddleware(context);
      return await Student.find();
    },
    
    student: async (_, { id }, context) => {
      authMiddleware(context);
      return await Student.findById(id);
    },

    projects: async (_, __, context) => {
      authMiddleware(context);
      const projects = await Project.find().populate('students');
      return projects.map(project => ({
        ...project._doc,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString()
      }));
    },
    
    project: async (_, { id }, context) => {
      authMiddleware(context);
      const project = await Project.findById(id).populate('students');
      return {
        ...project._doc,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString()
      };
    },

    tasks: async (_, __, context) => {
      authMiddleware(context);
      const tasks = await Task.find().populate('project').populate('assignedStudent');
      return tasks.map(task => ({
        ...task._doc,
        dueDate: task.dueDate ? task.dueDate.getTime() : null
      }));
    },

    task: async (_, { id }, context) => {
      authMiddleware(context);
      const task = await Task.findById(id).populate('project').populate('assignedStudent');
      return {
        ...task._doc,
        dueDate: task.dueDate ? task.dueDate.getTime() : null
      };
    },

    messages: async (_, __, context) => {
      authMiddleware(context);
      return await Message.find().populate('sender recipient');
    },
    
    messagesBetweenUsers: async (_, { senderId, recipientId }, context) => {
      authMiddleware(context);
      return await Message.find({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId }
        ]
      }).populate('sender recipient').sort({ timestamp: 1 });
    },

    me: async (_, __, context) => {
      authMiddleware(context);
      return await Student.findById(context.user.userId);
    }
  },

  Mutation: {

signUp: async (_, { name, password, isAdmin, universityId }) => {
  const existingUser = await Student.findOne({ name });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newStudent = new Student({ 
    name, 
    password: hashedPassword, 
    isAdmin, 
    universityId 
  });
  
  const user = await newStudent.save();

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, user };
},


signIn: async (_, { name, password }) => {
  try {
    const user = await Student.findOne({ name });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Compare hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid username or password');
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, user };
  } catch (err) {
    console.error('Sign in error:', err);
    throw err;
  }
},


updateStudent: async (_, { id, name, password, isAdmin, universityID }, context) => {
  authMiddleware(context);
  adminMiddleware(context);
  const updateData = { 
    name, 
    isAdmin, 
    universityId: universityID 
  };
  
  // Only hash password if it's being updated
  if (password) {
    updateData.password = await bcrypt.hash(password, saltRounds);
  }
  
  return await Student.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
},
    deleteStudent: async (_, { id }, context) => {
      authMiddleware(context);
      adminMiddleware(context);
      const deletedStudent = await Student.findByIdAndDelete(id);
      return deletedStudent ? true : false;
    },

  
    createProject: async (_, { title, description, category, studentIds, startDate, endDate }, context) => {
      authMiddleware(context);
      adminMiddleware(context);
      const newProject = new Project({
        title,
        description,
        category,
        students: studentIds,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "Pending",
        progress: 0
      });
      
      const savedProject = await newProject.save();
      await savedProject.populate('students');
      
      return {
        ...savedProject._doc,
        startDate: savedProject.startDate.toISOString(),
        endDate: savedProject.endDate.toISOString()
      };
    },

    updateProject: async (_, { id, title, description, category, studentIds, startDate, endDate, status }, context) => {
      authMiddleware(context);
      adminMiddleware(context);
      const updateData = {
        title,
        description,
        category,
        students: studentIds,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status })
      };
      
      const updatedProject = await Project.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('students');
      
      return {
        ...updatedProject._doc,
        startDate: updatedProject.startDate.toISOString(),
        endDate: updatedProject.endDate.toISOString()
      };
    },

    deleteProject: async (_, { id }, context) => {
      authMiddleware(context);
      adminMiddleware(context);
      const deletedProject = await Project.findByIdAndDelete(id);
      return deletedProject ? true : false;
    },

    
    createTask: async (_, { name, description, projectId, assignedStudentId, status, dueDate }, context) => {
      authMiddleware(context);
      if (!dueDate) throw new Error('Due date is required');
      
      const taskDueDate = new Date(dueDate);
      if (isNaN(taskDueDate.getTime())) throw new Error('Invalid due date format');

      const newTask = new Task({
        name,
        description,
        project: projectId,
        assignedStudent: assignedStudentId,
        status,
        dueDate: taskDueDate
      });
      
      const savedTask = await newTask.save();
      await savedTask.populate('project assignedStudent');
      
      return {
        ...savedTask._doc,
        dueDate: savedTask.dueDate.getTime()
      };
    },

    updateTask: async (_, { id, name, description, projectId, assignedStudentId, status, dueDate }, context) => {
      authMiddleware(context);
      const updateData = {
        name,
        description,
        project: projectId,
        assignedStudent: assignedStudentId,
        status,
        ...(dueDate && { dueDate: new Date(dueDate) })
      };
      
      if (dueDate && isNaN(new Date(dueDate).getTime())) {
        throw new Error('Invalid due date format');
      }
      
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('project assignedStudent');
      
      return {
        ...updatedTask._doc,
        dueDate: updatedTask.dueDate.getTime()
      };
    },

    deleteTask: async (_, { id }, context) => {
      authMiddleware(context);
      adminMiddleware(context);
      const deletedTask = await Task.findByIdAndDelete(id);
      return deletedTask ? true : false;
    },

    createMessage: async (_, { senderId, recipientId, text }, context) => {
      authMiddleware(context);
      try {
        // Verify sender and recipient exist
        const [sender, recipient] = await Promise.all([
          Student.findById(senderId),
          Student.findById(recipientId)
        ]);
    
        if (!sender || !recipient) {
          throw new Error('Sender or recipient not found');
        }
    
        const newMessage = new Message({ 
          sender: senderId, 
          recipient: recipientId,
          text,
          timestamp: new Date()
        });
    
        const savedMessage = await newMessage.save();
        return await Message.findById(savedMessage._id)
          .populate('sender recipient');
      } catch (error) {
        console.error('Error creating message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;
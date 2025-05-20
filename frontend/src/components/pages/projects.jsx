import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import AddProjectModal from "../modals/addProjectModal";
import EditProjectModal from "../modals/editProjectModal";
import { useTheme } from "../../context/themeContext";

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

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      universityId
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

const calculateProgressFromTime = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const totalTime = end - start;
  const elapsedTime = now - start;

  return Math.min(100, Math.round((elapsedTime / totalTime) * 100));
};

const ProjectsPage = () => {
  const { theme } = useTheme(); // Get the current theme
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch projects and students from GraphQL
  const {
    loading: projectsLoading,
    data: projectsData,
    refetch: refetchProjects
  } = useQuery(GET_PROJECTS);

  const {
    loading: studentsLoading,
    data: studentsData
  } = useQuery(GET_STUDENTS);

  // GraphQL mutations
  const [createProject] = useMutation(CREATE_PROJECT);
  const [updateProject] = useMutation(UPDATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  // Calculate progress for projects and combine with fetched data
  const projects = projectsData?.projects?.map(project => ({
    ...project,
    progress: calculateProgressFromTime(project.startDate, project.endDate)
  })) || [];

  const students = studentsData?.students || [];

  const handleNewProjectSubmit = async (newProject) => {
    try {
      await createProject({
        variables: {
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          studentIds: newProject.selectedStudents,
          startDate: newProject.startDate,
          endDate: newProject.endDate
        }
      });
      await refetchProjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleUpdateProject = async (updatedData) => {
    try {
      await updateProject({
        variables: {
          id: updatedData._id,
          title: updatedData.title,
          description: updatedData.description,
          category: updatedData.category,
          studentIds: updatedData.selectedStudents,
          startDate: updatedData.startDate,
          endDate: updatedData.endDate
        }
      });
      await refetchProjects();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject({
        variables: { id: projectId }
      });
      await refetchProjects();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Apply search + filter logic
  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === "all" || project.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  
  if (projectsLoading || studentsLoading) {
    return (
      <div className={`h-[95vh] flex items-center justify-center 
        ${theme === 'dark' ? 'bg-background-dark text-text-dark' : 'bg-background-light text-text-light'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={`h-[95vh] overflow-y-auto px-6 py-6 
      ${theme === 'dark' ? 'bg-background-dark text-text-dark' : 'bg-background-light text-text-light'}`}>
      <div className={`border-b pb-6 flex flex-col gap-4 text-[15px] 
        ${theme === 'dark' ? 'border-[#3d3d3d]' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-bold m-0 
          ${theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'}`}>
          Projects Overview
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            className={`text-sm rounded px-4 py-2 transition hover:scale-105
              ${theme === 'dark' 
                ? 'bg-primary-dark text-white hover:bg-blue-700' 
                : 'bg-primary-light text-white hover:bg-blue-600'}`}
            onClick={() => setIsModalOpen(true)}
          >
            + New Project
          </button>

          <input
            type="text"
            placeholder="Search project..."
            className={`w-1/2 p-2 text-sm border rounded
              ${theme === 'dark' 
                ? 'border-[#919191] bg-card-dark text-text-dark' 
                : 'border-gray-300 bg-card-light text-text-light'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className={`p-2 text-sm border rounded cursor-pointer
              ${theme === 'dark' 
                ? 'border-[#919191] bg-card-dark text-text-dark' 
                : 'border-gray-300 bg-card-light text-text-light'}`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="on hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-center mt-6">
        {filteredProjects.length === 0 ? (
          <p className={`mt-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No matching projects found.
          </p>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => {
                setSelectedProject(project);
                setIsEditModalOpen(true);
              }}
              className={`rounded-lg shadow-md p-4 w-[300px] min-h-[260px] flex flex-col justify-between 
                transition-colors duration-200 cursor-pointer
                ${theme === 'dark' 
                  ? 'bg-card-dark border-gray-600 hover:bg-[#4a4a4a]' 
                  : 'bg-card-light border-gray-300 hover:bg-gray-100'}`}
            >
              <div>
                <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                <p className="text-sm mb-1">{project.description}</p>
                <p className="text-sm mb-1">
                  Status:{" "}
                  <span className={`font-medium 
                    ${theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'}`}>
                    {project.status}
                  </span>
                </p>
                <p className="text-sm mb-1">
                  Students: {project.students?.map((s) => s?.name || "Unknown").join(", ")}
                </p>
                <p className="text-sm mb-2">Category: {project.category}</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <progress 
                    value={project.progress} 
                    max="100" 
                    className={`w-full 
                      ${theme === 'dark' ? '[&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500' : '[&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-blue-400'}`} 
                  />
                  <span className="text-sm">{project.progress}%</span>
                </div>
                <div className={`mt-2 text-xs 
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Start: {new Date(project.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                  <p>End: {new Date(project.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
 <AddProjectModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewProjectSubmit}
        students={students}
        refetchProjects={refetchProjects}
        categories={[
          "Software Development",
          "Software Maintenance",
          "Software Design",
          "Software Prototyping",
          "Software Research"
        ]}
      />
      <EditProjectModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={selectedProject}
        students={students}
        refetchProjects={refetchProjects}
        categories={[
          "Software Development",
          "Software Maintenance",
          "Software Design",
          "Software Prototyping",
          "Software Research"
        ]}
      />
    </div>
  );
};

export default ProjectsPage;
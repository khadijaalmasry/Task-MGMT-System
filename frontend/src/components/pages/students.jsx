import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useTheme } from "../../context/themeContext";
import ResetPasswordModal from "../modals/ResetPasswordModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      universityId
      isAdmin
    }
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

const StudentsPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch students from GraphQL
  const {
    loading: studentsLoading,
    data: studentsData,
    refetch: refetchStudents
  } = useQuery(GET_STUDENTS);

  // GraphQL mutations
  const [resetPassword] = useMutation(RESET_PASSWORD);
  const [deleteStudent] = useMutation(DELETE_STUDENT);

  const students = studentsData?.students || [];

  // Apply search filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.universityId && 
        student.universityId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleResetPassword = async () => {
    try {
      await resetPassword({
        variables: {
          id: selectedStudent._id,
          newPassword: newPassword
        }
      });
      setIsResettingPassword(false);
      setSelectedStudent(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteStudent = async () => {
    try {
      await deleteStudent({
        variables: { id: studentToDelete._id }
      });
      await refetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setShowDeleteConfirmation(false);
      setStudentToDelete(null);
    }
  };

  const cancelDeleteStudent = () => {
    setShowDeleteConfirmation(false);
    setStudentToDelete(null);
  };

  if (studentsLoading) {
    return (
      <div className={`h-[95vh] flex items-center justify-center 
        ${theme === 'dark' ? 'bg-background-dark text-text-dark' : 'bg-background-light text-text-light'}`}>
        Loading students...
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
          Student Management
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name or university ID..."
            className={`w-1/2 p-2 text-sm border rounded
              ${theme === 'dark' 
                ? 'border-[#919191] bg-card-dark text-text-dark' 
                : 'border-gray-300 bg-card-light text-text-light'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className={`grid grid-cols-1 gap-4 
          ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>
          {filteredStudents.length === 0 ? (
            <p className={`mt-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No matching students found.
            </p>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student._id}
                className={`p-4 rounded-lg shadow-sm flex justify-between items-center
                  ${theme === 'dark' 
                    ? 'bg-card-dark border-gray-600' 
                    : 'bg-card-light border-gray-300'}`}
              >
                <div>
                  <h3 className="text-lg font-medium">{student.name}</h3>
                  <p className="text-sm">
                    University ID: {student.universityId || "Not provided"}
                  </p>
                  <p className="text-xs">
                    {student.isAdmin ? "Admin" : "Student"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsResettingPassword(true);
                    }}
                    className={`px-3 py-1 text-sm rounded
                      ${theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student)}
                    className={`px-3 py-1 text-sm rounded
                      ${theme === 'dark' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-red-500 hover:bg-red-600'} text-white`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ResetPasswordModal
        visible={isResettingPassword}
        onClose={() => {
          setIsResettingPassword(false);
          setSelectedStudent(null);
          setNewPassword("");
        }}
        onSubmit={handleResetPassword}
        student={selectedStudent}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
      />

      <DeleteConfirmationModal
        visible={showDeleteConfirmation}
        onCancel={cancelDeleteStudent}
        onConfirm={confirmDeleteStudent}
        student={studentToDelete}
      />
    </div>
  );
};

export default StudentsPage;
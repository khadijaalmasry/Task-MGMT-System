import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import ChartComponent from '../chart';
import Clock from '../clock';
import { useTheme } from '../../context/themeContext'; 
const Home = () => {
    const { theme } = useTheme();
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
    const { data, loading, error } = useQuery(GET_DASHBOARD_DATA);

    if (loading) return <p className={`p-10 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Loading...</p>;
    if (error) return <p className="text-red-500 p-10">Error: {error.message}</p>;

    const allStudents = data.students || [];
    const students = allStudents.filter(student => !student.isAdmin);
    const projects = data.projects || [];
    const tasks = data.tasks || [];

    return (
        <div className={`pr-0 w-[100%] h-[95vh] overflow-hidden m-0 
            ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
            <div className={`flex justify-between items-center p-6 border-b 
                ${theme === 'dark' ? 'border-[#3d3d3d]' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-bold m-0 
                    ${theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'}`}>
                    Welcome to the Task Management System
                </h2>
                <Clock />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 m-20 my-5">
                {[
                    { label: "Number of Projects", value: projects.length },
                    { label: "Number of Students", value: students.length },
                    { label: "Number of Tasks", value: tasks.length },
                    { 
                        label: "Number of Finished Projects", 
                        value: projects.filter(p => p.status === 'Completed').length 
                    }
                ].map((item, index) => (
                    <div 
                        key={index}
                        className={`border-2 w-[17%] min-w-[140px] p-6 text-center text-sm font-bold rounded-lg shadow-md 
                            transition-transform hover:scale-105
                            ${theme === 'dark' 
                                ? 'border-[#484849] bg-card-dark hover:bg-[#484849] text-text-dark' 
                                : 'border-gray-300 bg-card-light hover:bg-gray-200 text-text-light'}`}
                    >
                        {item.label} <br />
                        <span className="text-base">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <p className={`text-xs text-center mb-2 font-semibold tracking-wide 
                ${theme === 'dark' ? 'text-[#515151]' : 'text-gray-500'}`}>
                Admin Dashboard Overview
            </p>

            <div className={`h-[calc(100%-20vh)] mx-auto rounded-lg p-3 
                ${theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'}`}>
                <ChartComponent data={{ students, projects, tasks }} />
            </div>
        </div>
    );
};

export default Home;
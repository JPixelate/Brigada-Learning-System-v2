import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeHeader from './components/EmployeeHeader';
import FloatingShapes from '../components/FloatingShapes';

const EmployeeLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-main-bg text-main-text transition-colors duration-300">
      <FloatingShapes />
      <EmployeeHeader />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 fade-in">
        <Outlet />
      </main>
      {/* Footer can go here */}
    </div>
  );
};

export default EmployeeLayout;

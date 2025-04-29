import React from 'react';
import { Navigate } from 'react-router-dom';
import Index from '../views/dashboard/index';
import UserProfile from '../views/dashboard/app/user-profile';
import UserAdd from '../views/dashboard/app/user-add';
import UserList from '../views/dashboard/app/user-list';
import Reclamation from '../views/dashboard/app/Reclamation';
import ReclamationAdd from '../views/dashboard/app/Reclamation-add';
import Widgetbasic from '../views/dashboard/widget/widgetbasic';
import Widgetcard from '../views/dashboard/widget/widgetcard';
import Widgetchart from '../views/dashboard/widget/widgetchart';
import Solid from '../views/dashboard/icons/solid';
import Outline from '../views/dashboard/icons/outline';
import DualTone from '../views/dashboard/icons/dual-tone';
import FormElement from '../views/dashboard/from/form-element';
import FormValidation from '../views/dashboard/from/form-validation';
import FormWizard from '../views/dashboard/from/form-wizard';
import BootstrapTable from '../views/dashboard/table/bootstrap-table';
import TableData from '../views/dashboard/table/table-data';
import Vector from '../views/dashboard/maps/vector';
import Google from '../views/dashboard/maps/google';
import Billing from '../views/dashboard/special-pages/billing';
import Kanban from '../views/dashboard/special-pages/kanban';
import Pricing from '../views/dashboard/special-pages/pricing';
import Timeline from '../views/dashboard/special-pages/timeline';
import Calender from '../views/dashboard/special-pages/calender';
import RtlSupport from '../views/dashboard/special-pages/RtlSupport';
import Admin from '../views/dashboard/admin/admin';
import Default from '../layouts/dashboard/default';
import Login from '../views/dashboard/auth/sign-in';
import Unauthorized from '../views/dashboard/app/unauthorized'; 

import ReclamationClient from  '../views/dashboard/app/ReclamationClient';
import ReclamationAgent from  '../views/dashboard/app/ReclamationAgent';

import ReclamationDetails from'../views/dashboard/app/ReclamationDetails';

// Auth Guard
const AuthGuard = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? children : <Navigate to='/' />;
};
const RedirectIfLoggedIn = () => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? <Navigate to='/dashboard' /> : <Login />;
};

export const DefaultRouter = [
  {
    path: '/',
    element: <Default />,
    children: [
      {
        path: 'dashboard',
        element: (
          <AuthGuard>
            <Index />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/special-pages/billing',
        element: (
          <AuthGuard>
            <Billing />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/special-pages/calender',
        element: (
          <AuthGuard>
            <Calender />
          </AuthGuard>
        ),
      },
      {
        path: '/dashboard/:id',
        element: (
          <AuthGuard>
            <ReclamationDetails  />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/special-pages/kanban',
        element: (
          <AuthGuard>
            <Kanban />
          </AuthGuard>
        ),
      },

      {
        path: 'dashboard/special-pages/pricing',
        element: (
          <AuthGuard>
            <Pricing />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/special-pages/timeline',
        element: (
          <AuthGuard>
            <Timeline />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/special-pages/rtl-support',
        element: (
          <AuthGuard>
            <RtlSupport />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/user-profile',
        element: (
          <AuthGuard>
            <UserProfile />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/user-add',
        element: (
          <AuthGuard>
            <UserAdd />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/user-list',
        element: (
          <AuthGuard>
            <UserList />
          </AuthGuard>
        ),
      },
  
      {
        path: 'dashboard/app/reclamation',
        element: (
          <AuthGuard>
            <Reclamation />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/Reclamation-add',
        element: (
          <AuthGuard>
            <ReclamationAdd />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/ReclamationClient',
        element: (
          <AuthGuard>
            <ReclamationClient />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/ReclamationAgent',
        element: (
          <AuthGuard>
            <ReclamationAgent />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/admin/admin',
        element: (
          <AuthGuard>
            <Admin />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/widget/widgetbasic',
        element: (
          <AuthGuard>
            <Widgetbasic />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/widget/widgetchart',
        element: (
          <AuthGuard>
            <Widgetchart />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/widget/widgetcard',
        element: (
          <AuthGuard>
            <Widgetcard />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/app/unauthorized',
        element: (
          <AuthGuard>
           <Unauthorized />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/map/google',
        element: (
          <AuthGuard>
            <Google />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/map/vector',
        element: (
          <AuthGuard>
            <Vector />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/form/form-element',
        element: (
          <AuthGuard>
            <FormElement />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/form/form-wizard',
        element: (
          <AuthGuard>
            <FormWizard />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/form/form-validation',
        element: (
          <AuthGuard>
            <FormValidation />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/table/bootstrap-table',
        element: (
          <AuthGuard>
            <BootstrapTable />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/table/table-data',
        element: (
          <AuthGuard>
            <TableData />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/icon/solid',
        element: (
          <AuthGuard>
            <Solid />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/icon/outline',
        element: (
          <AuthGuard>
            <Outline />
          </AuthGuard>
        ),
      },
      {
        path: 'dashboard/icon/dual-tone',
        element: (
          <AuthGuard>
            <DualTone />
          </AuthGuard>
        ),
      },
      {
        path: '/',
        element: <RedirectIfLoggedIn />,

      },
    ],
  },
];
